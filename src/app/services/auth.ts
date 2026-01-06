import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { collection, collectionSnapshots, doc, Firestore, query, setDoc, where } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { Customer } from './customer';
import { environment } from 'src/environments/environment';

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
  constructor(private customerService: Customer){
    console.log('[AuthService] Constructor started');
    
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

  async signUpWithEmailAndPassword(email: string, password: string, name: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      //add user to firestore in new function
      console.log(userCredential.user);
      let result = await this.addUserToFirestore(userCredential.user,'email',false, email, name);
   
      //send email verification
      await sendEmailVerification(userCredential.user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async addUserToFirestore(user: any,login:string, verified: boolean,email: string, name: string) {
    try {
      const dateNow = new Date();
      const data: any = {
        uid: user.uid,
        email: email || null,
        fname:name,
        lname:'',
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

}
