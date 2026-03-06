import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithCredential, signInWithPopup } from '@angular/fire/auth';
import { collection, collectionSnapshots, doc, Firestore, query, setDoc, where } from '@angular/fire/firestore';
import { firstValueFrom, map } from 'rxjs';
import { Customer } from './customer';
import { environment } from 'src/environments/environment';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import { SignInWithApple, SignInWithAppleOptions, SignInWithAppleResponse } from '@capacitor-community/apple-sign-in';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  currentUser: User | null = null;
  private authStateReady: Promise<User | null>;
  private authStateResolver?: (user: User | null) => void;
  userDetails: any;
  isAdmin: boolean = false;
  private googleAuthInitialized = false;
  constructor(private customerService: Customer){
    console.log('[AuthService] Constructor started');

    // Initialize Google Auth once at startup for native platforms
    this.initGoogleAuth();

    // Create a promise that resolves when auth state is determined
    this.authStateReady = new Promise((resolve) => {
      this.authStateResolver = resolve;
    });

    // Add a timeout to prevent infinite waiting
    setTimeout(() => {
      if (this.authStateResolver) {
        console.warn('[AuthService] Auth state timeout - resolving with null');
        this.authStateResolver(null);
        this.authStateResolver = undefined;
      }
    }, 10000); // 10 second timeout

    // Listen to auth state changes
    this.auth.onAuthStateChanged((user) => {
      console.log('[AuthService] onAuthStateChanged fired:', user ? 'User found' : 'No user');
      if(user){
        console.log('User found', user);
       this.isAdmin = environment.adminpeople.includes(user.uid);

        this.currentUser = user;
        this.getUserByEmail(user.email || '').subscribe((res:any) => {
          if(res.length > 0){
            this.userDetails = res[0];
            console.log(this.userDetails, 'user details');
          //  this.isAdmin = environment.adminpeople.includes(this.userDetails.id);
            this.customerService.getStripeCustomerData(user.email || '');
          }
        });
      }else{
        console.log('[AuthService] No user found');
        this.currentUser = null;
      }
      // Resolve the promise on first auth state change
      if (this.authStateResolver) {
        console.log('[AuthService] Resolving auth state promise');
        this.authStateResolver(user);
        this.authStateResolver = undefined; // Clear resolver after first use
      }
    });
    
    console.log('[AuthService] Constructor completed');
  }

  /**
   * Wait for auth state to be determined
   * This should be called before checking currentUser
   */
  async waitForAuthState(): Promise<User | null> {
    return this.authStateReady;
  }

  public getUserByEmail(email : string){

    const usersRef = collection(this.firestore, 'users');

    const q = query(usersRef, where('email', '==', email));
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
 
  }


  async signInWithEmailAndPassword(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  }

  async signUpWithEmailAndPassword(email: string, password: string, fname: string, lname: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      //add user to firestore in new function
      console.log(userCredential.user);
      let result = await this.addUserToFirestore(userCredential.user,'email',false, email, fname, lname);
   
      //send email verification
      await sendEmailVerification(userCredential.user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addUserToFirestore(user: any,login:string, verified: boolean,email: string, fname: string, lname: string) {
    try {
      const dateNow = new Date();
      const data: any = {
        uid: user.uid,
        email: email || null,
        fname:fname,
        lname:lname,
        photoURL: user.photoURL || null,
        dateCreated: dateNow,
        dateEdited: dateNow,
        loginType: login,
        status: 'missing-payment-method',
        roles: {
          subscriber: true,
          editor: false,
          admin: false
        }
      };
      //merge data with existing data if exists using merge: true
      await setDoc(doc(this.firestore, 'users', user.uid), data, { merge: true });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async signOut() {
    try {
      await signOut(this.auth);
      this.currentUser = null;
      //clear auth state resolver
      this.authStateResolver = undefined;
      //reload page
     
      return true;
    } catch (error) {
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error) {
      throw error;
    }
  }

  //get current user
  async getCurrentUser() {
    try {
      const user = this.auth.currentUser;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getToken() {
    try {
      const user = await this.auth.currentUser;
      console.log("user", user);
      const token = await user?.getIdToken();
      if(!token) return localStorage.getItem("token");
      console.log("token after try", token);

      return token;
    } catch (e) {
      console.log("In catch", localStorage.getItem("token"));

      return localStorage.getItem("token");
    }
  }

  // ============ SOCIAL SIGN-IN METHODS ============

  private async initGoogleAuth() {
    if (this.googleAuthInitialized || !Capacitor.isNativePlatform()) return;
    try {
      const platform = Capacitor.getPlatform();
      if (platform === 'android') {
        // Android: pass web clientId explicitly
        await GoogleAuth.initialize({
          clientId: environment.googleClientId,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        });
      } else {
        // iOS: let the plugin read CLIENT_ID from GoogleService-Info.plist
        await GoogleAuth.initialize({
          scopes: ['profile', 'email'],
          grantOfflineAccess: true
        });
      }
      this.googleAuthInitialized = true;
      console.log('[AuthService] GoogleAuth initialized for', platform);
    } catch (error) {
      console.error('[AuthService] GoogleAuth init failed:', error);
    }
  }

  async signInWithGoogle() {
    try {
      let userCredential;

      if (Capacitor.isNativePlatform()) {
        // Native: use Capacitor GoogleAuth plugin
        const googleUser = await GoogleAuth.signIn();
        console.log('[Google] Full response:', JSON.stringify(googleUser));
        const idToken = googleUser.authentication.idToken;
        console.log('[Google] idToken present:', !!idToken, 'length:', idToken?.length);
        if (!idToken) {
          throw new Error('Google sign-in failed - no ID token returned');
        }
        const credential = GoogleAuthProvider.credential(idToken);
        userCredential = await signInWithCredential(this.auth, credential);
      } else {
        // Web: use Firebase popup
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        userCredential = await signInWithPopup(this.auth, provider);
      }

      console.log('Firebase user:', userCredential.user);
      await this.createOrUpdateSocialUser(
        userCredential.user,
        'google',
        userCredential.user.displayName || userCredential.user.email || ''
      );
      return userCredential;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async signInWithFacebook() {
    try {
      let userCredential;

      if (Capacitor.isNativePlatform()) {
        // Native: use Capacitor FacebookLogin plugin
        console.log('[Facebook] Step 1: Calling FacebookLogin.login()...');
        const result = await FacebookLogin.login({ permissions: ['email', 'public_profile'] });
        console.log('[Facebook] Step 2: Got result:', JSON.stringify(result));
        if (!result.accessToken) {
          throw new Error('Facebook login failed - no access token');
        }
        console.log('[Facebook] Step 3: Creating Firebase credential...');
        const credential = FacebookAuthProvider.credential(result.accessToken.token);
        console.log('[Facebook] Step 4: Calling signInWithCredential...');
        userCredential = await signInWithCredential(this.auth, credential);
        console.log('[Facebook] Step 5: Firebase auth SUCCESS');
      } else {
        // Web: use Firebase popup
        const provider = new FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');
        userCredential = await signInWithPopup(this.auth, provider);
      }

      console.log('Firebase user:', userCredential.user);
      const userName = userCredential.user.displayName || userCredential.user.email || '';
      await this.createOrUpdateSocialUser(userCredential.user, 'facebook', userName);
      return userCredential;
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Apple using Capacitor plugin (iOS only)
   */
  async signInWithApple() {
    try {
      const rawNonce = this.generateNonce();
      const hashedNonce = await this.sha256(rawNonce);

      const options: SignInWithAppleOptions = {
        clientId: environment.appleClientId || 'com.justmove.supplement',
        redirectURI: environment.appleRedirectUri || 'https://ifyoucanmove-dev.firebaseapp.com/__/auth/handler',
        scopes: 'email name',
        state: 'state',
        nonce: rawNonce  // Plugin passes this to Apple, which hashes it internally
      };

      const result: SignInWithAppleResponse = await SignInWithApple.authorize(options);
      console.log('Apple sign-in result:', result);

      if (!result.response || !result.response.identityToken) {
        throw new Error('Apple sign-in failed - no identity token');
      }

      // Firebase needs the raw nonce — it hashes it and compares with Apple's token
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: result.response.identityToken,
        rawNonce: rawNonce
      });

      // Sign in to Firebase with the credential
      const userCredential = await signInWithCredential(this.auth, credential);
      console.log('Firebase user:', userCredential.user);

      // Get user name (Apple may provide it on first sign-in only)
      const userName = result.response.givenName
        ? `${result.response.givenName} ${result.response.familyName || ''}`.trim()
        : userCredential.user.displayName || userCredential.user.email || '';

      // Check if user exists in Firestore, if not create
      await this.createOrUpdateSocialUser(userCredential.user, 'apple', userName);

      return userCredential;
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      throw error;
    }
  }

  /**
   * Create or update user in Firestore after social sign-in
   */
  private async createOrUpdateSocialUser(user: User, loginType: string, name: string) {
    try {
      const existingUsers = await firstValueFrom(this.getUserByEmail(user.email || ''));

      if (existingUsers && existingUsers.length > 0) {
        const dateNow = new Date();
        await setDoc(doc(this.firestore, 'users', user.uid), {
          dateEdited: dateNow,
          lastLogin: dateNow
        }, { merge: true });
        console.log('Existing user updated');
      } else {
        await this.addUserToFirestore(user, loginType, true, user.email || '', name,'');
        console.log('New social user created');
      }
    } catch (error) {
      console.error('Error creating/updating social user:', error);
      throw error;
    }
  }

  /**
   * Generate a random nonce for Apple Sign-In
   */
  private generateNonce(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  }

  /**
   * SHA256 hash a string (pure JS - crypto.subtle not available in Capacitor WebView)
   */
  private async sha256(input: string): Promise<string> {
    const utf8 = new TextEncoder().encode(input);
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];
    const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
    const pad = (msg: Uint8Array): Uint8Array => {
      const bits = msg.length * 8;
      const len = msg.length + 1;
      const padLen = len % 64 <= 56 ? 56 - (len % 64) : 120 - (len % 64);
      const padded = new Uint8Array(len + padLen + 8);
      padded.set(msg);
      padded[msg.length] = 0x80;
      const view = new DataView(padded.buffer);
      view.setUint32(padded.length - 4, bits, false);
      return padded;
    };
    const padded = pad(utf8);
    const h = [...H];
    for (let i = 0; i < padded.length; i += 64) {
      const w = new Array(64);
      for (let t = 0; t < 16; t++) {
        w[t] = (padded[i+t*4]<<24)|(padded[i+t*4+1]<<16)|(padded[i+t*4+2]<<8)|padded[i+t*4+3];
      }
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(7,w[t-15]) ^ rotr(18,w[t-15]) ^ (w[t-15]>>>3);
        const s1 = rotr(17,w[t-2]) ^ rotr(19,w[t-2]) ^ (w[t-2]>>>10);
        w[t] = (w[t-16] + s0 + w[t-7] + s1) | 0;
      }
      let [a,b,c,d,e,f,g,hh] = h;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(6,e) ^ rotr(11,e) ^ rotr(25,e);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (hh + S1 + ch + K[t] + w[t]) | 0;
        const S0 = rotr(2,a) ^ rotr(13,a) ^ rotr(22,a);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) | 0;
        hh = g; g = f; f = e; e = (d + temp1) | 0;
        d = c; c = b; b = a; a = (temp1 + temp2) | 0;
      }
      h[0]=(h[0]+a)|0; h[1]=(h[1]+b)|0; h[2]=(h[2]+c)|0; h[3]=(h[3]+d)|0;
      h[4]=(h[4]+e)|0; h[5]=(h[5]+f)|0; h[6]=(h[6]+g)|0; h[7]=(h[7]+hh)|0;
    }
    return h.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
  }

}
