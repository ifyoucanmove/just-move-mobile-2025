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
   * SHA256 hash a string (needed for Apple Sign-In nonce)
   */
  private async sha256(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

}
