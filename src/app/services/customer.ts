import { Injectable } from '@angular/core';
import { collection, Firestore, onSnapshot, query, where } from '@angular/fire/firestore';
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
  ) {}

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
}
