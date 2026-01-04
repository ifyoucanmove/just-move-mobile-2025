import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, getDocs, onSnapshot, query, updateDoc, where } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Customer {
  customer$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  customerSubscribed$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  
  customer: any;
  email!: string; // this value is passed in from calling point
  status: string | null = null;
  statusSuper!: boolean;
  challengeStatus = null;
  challengeNextStatus = null;
  refreshData = false;
  refreshMessage = "";
  customerId!: string;
  isSuperChallenge = false;
  challengeStatusArray = [];
  subType = "";
  subPlan = "";
  isCompletedEmails!: boolean;
  isTrial!: boolean;
  challengePurchases = [];
  memberDiscount = 10;
  customerChallengeData: any = {};
  challengeData: any;

  constructor(
    private firestore: Firestore
  ) {
    
  }

  async getStripeCustomerData(userEmail: string) {
    this.loadCustomerSubscriptionDatas(userEmail).subscribe((res:any) => {
      console.log("Stripe res", res);
      if (res && res.length) {
        const stripeCustomer: any = res[0];
        this.customer = stripeCustomer;
        this.customer$.next(stripeCustomer);
        if (stripeCustomer.status) {
          this.status = stripeCustomer.status; // status
          if (this.status == "active") {
            this.customerSubscribed$.next(true);
          } else {
            this.customerSubscribed$.next(false);
          }
        } else {
          this.status = '';
          this.customerSubscribed$.next(false);
        }
        if (stripeCustomer.challengeStatus) {
          this.challengeStatus = stripeCustomer.challengeStatus; // challengeStatus
        }
        if (stripeCustomer.challengeStatusArray) {
          this.challengeStatusArray = stripeCustomer.challengeStatusArray; // challengeStatus
        }
        if (stripeCustomer.challengeNextStatus) {
          this.challengeNextStatus = stripeCustomer.challengeNextStatus;
        }
        if (stripeCustomer.refreshData) {
          this.refreshData = stripeCustomer.refreshData; // refreshData
        }
        if (stripeCustomer.refreshMessage) {
          this.refreshMessage = stripeCustomer.refreshMessage;
        }
        if (stripeCustomer.customer_id) {
          this.customerId = stripeCustomer.customer_id;
        }
        if (stripeCustomer.isSuperChallenge) {
          this.isSuperChallenge = stripeCustomer.isSuperChallenge;
        } else {
          this.isSuperChallenge = false;
        }
        if (stripeCustomer.statusSuper === "active") {
          this.statusSuper = true;
        } else {
          this.statusSuper = false;
        }
        if (stripeCustomer.subType) {
          this.subType = stripeCustomer.subType;
        }
        if (stripeCustomer.subPlan) {
          this.subPlan = stripeCustomer.subPlan;
        }
        if (stripeCustomer.challengeData) {
          this.customerChallengeData = stripeCustomer.challengeData;
        }

        if (stripeCustomer.isCompletedEmails !== undefined) {
          this.isCompletedEmails = stripeCustomer.isCompletedEmails;
        }
        if (stripeCustomer.isTrial) {
          this.isTrial = true;
        } else {
          this.isTrial = false;
        }
        if (stripeCustomer.challengePurchases) {
          this.challengePurchases = stripeCustomer.challengePurchases;
        } else {
          this.challengePurchases = [];
        }
      } else {
        this.customer$.next(null);
        this.customer = null;
        this.customerSubscribed$.next(false);
        this.status = null;
        this.statusSuper = false;
        this.challengeStatus = null;
        this.challengeNextStatus = null;
        this.refreshData = false;
        this.refreshMessage = "";
        this.isSuperChallenge = false;
        this.challengeStatusArray = [];
        this.subType = "";
        this.isCompletedEmails;
        this.isTrial;
        this.challengePurchases = [];
      }
    });
  }

  loadCustomerSubscriptionDatas(email:string) {

    const stripeCustomersRef = collection(this.firestore, 'stripe_customers');
    const q = query(stripeCustomersRef, where('email', '==', email));
    return new Observable<any>(observer => {
      const unsubscribe = onSnapshot(q, snapshot => {
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(results);
      });
      return () => unsubscribe();
    });

  }
  public updateCustomer(id: string, values: any): Observable<any> {
  return new Observable<any>((observer) => {
    const docRef = doc(this.firestore, `stripe_customers/${id}`);
    updateDoc(docRef, values).then(
      (res) => {
        observer.next(res);
        observer.complete();
      },
      (err) => {
        observer.error(err);
      }
    );
  });
}
applyDiscount(priceValue: any) {
  let price = parseFloat(priceValue);
  if (typeof price !== 'number' || price < 0) {
    throw new Error('Invalid price. Please provide a positive number.');
  }
  const discountedPrice = price * (100 - this.memberDiscount) / 100;
  return discountedPrice // Return with two decimal places
}

/**
 * Check if user has purchased a specific challenge
 * Checks the justmoveshopifypurchases subcollection for active purchases
 * User can have multiple purchases of the same challenge
 * @param email - User's email
 * @param challengeId - The challenge ID to check
 * @returns Promise<boolean> - true if has any active, non-expired purchase
 */
async hasChallengePurchase(email: string, challengeId: string): Promise<boolean> {
  try {
    // Query all purchases for this challenge
    const purchasesRef = collection(this.firestore, `stripe_customers/${email.toLowerCase()}/justmoveshopifypurchases`);
    const q = query(purchasesRef, where('challengeId', '==', challengeId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false;
    }

    // Check if any purchase is active and not expired
    const now = new Date();
    for (const doc of snapshot.docs) {
      const purchase = doc.data();

      // Check if purchase is active
      if (purchase['status'] !== 'active') {
        continue;
      }

      // Check expiration date if it exists
      if (purchase['expirationDate']) {
        const expirationDate = purchase['expirationDate'].toDate ?
          purchase['expirationDate'].toDate() :
          new Date(purchase['expirationDate']);

        if (expirationDate >= now) {
          return true; // Found valid purchase
        }
      } else {
        // No expiration date means it's valid
        return false;
      }
    }

    return false; // No valid purchases found
  } catch (error) {
    console.error('Error checking challenge purchase:', error);
    return false;
  }
}
}
