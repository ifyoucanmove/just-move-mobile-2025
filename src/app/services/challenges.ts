import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, onSnapshot, where, getDocs, collectionData } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Challenges {
  private firestore = inject(Firestore);
  [key: string]: any;
  statusChallenges$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  statusSuperChallenges$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  allChallenges$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  challengeDatas: any[] = [];
  challengeDatasUnfiltered: any[] = [];
  selectedChallengeIndex!: number;

  challengeDay1: any;
  challengeDay2: any;
  challengeDay3: any;
  challengeDay4: any;
  challengeDay5: any;
  challengeDay6: any;
  challengeDay7: any;
  challengeDay8: any;
  challengeDay9: any;
  challengeDay10: any;
  challengeDay11: any;
  challengeDay12: any;
  challengeDay13: any;
  challengeDay14: any;
  challengeDay15: any;
  challengeDay16: any;
  challengeDay17: any;
  challengeDay18: any;
  challengeDay19: any;
  challengeDay20: any;
  challengeDay21: any;
  challengeDay22: any;
  challengeDay23: any;
  challengeDay24: any;
  challengeDay25: any;
  challengeDay26: any;
  challengeDay27: any;
  challengeDay28: any;
  challengeDay29: any;
  challengeDay30: any;
  constructor(
    private afs: Firestore
  ) {} 

  async loadAllChallengeData() {
    try {
      // Load from local storage first
      const stored = localStorage.getItem('challenges');
      let challenges = stored ? JSON.parse(stored) : null;
      
      if (challenges && challenges.length) {
        challenges = this.convertTimestamps(challenges);
        this.allChallenges$.next(challenges);
        this.formatChallenges(challenges);
      }

      // Subscribe to Firestore changes
      this.getAllActiveChallenges().subscribe(
        async (res) => {
          console.log("all challenges", res);
          if (res && res.length) {
            // Save locally
            localStorage.setItem('challenges', JSON.stringify(res));
            this.allChallenges$.next(res);
            this.formatChallenges(res);
          } else if (challenges) {
            this.allChallenges$.next(challenges);
            this.formatChallenges(challenges);
          }
        },
        async (err) => {
          console.error("Error loading challenges:", err);
          if (challenges) {
            this.allChallenges$.next(challenges);
            this.formatChallenges(challenges);
          }
        }
      );
    } catch (error) {
      console.error("Error in loadAllChallengeData:", error);
    }
  }

  getAllActiveChallenges(): Observable<any[]> {
    return new Observable((observer) => {
      const challengesRef = collection(this.firestore, 'challenges');
      const q = query(challengesRef);
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const challenges = snapshot.docs.map((doc) => {
            const data = doc.data() as any;
            return { id: doc.id, ...data };
          });
          observer.next(challenges);
        },
        (error) => {
          console.error("Error in getAllActiveChallenges:", error);
          observer.error(error);
        }
      );

      // Return cleanup function
      return () => unsubscribe();
    });
  }

  convertTimestamps(challenges: any[]): any[] {
    return challenges.map((challenge) => {
      const converted: any = { ...challenge };
      
      // Convert Firestore Timestamps to Date objects
      Object.keys(converted).forEach((key) => {
        if (converted[key] && typeof converted[key] === 'object') {
          // Check if it's a Firestore Timestamp (has seconds property)
          if (converted[key].seconds !== undefined) {
            converted[key] = new Date(converted[key].seconds * 1000);
          }
          // Check if it's a serialized timestamp object
          else if (converted[key]._seconds !== undefined) {
            converted[key] = new Date(converted[key]._seconds * 1000);
          }
        }
      });
      
      return converted;
    });
  }

  formatChallenges(allChallenges: any[]) {
    this.challengeDatas = allChallenges;
    this.challengeDatasUnfiltered = allChallenges;
    this.statusChallenges$.next(allChallenges.filter((challenge) => challenge._status == "active"));
    this.statusSuperChallenges$.next(
      allChallenges.filter((challenge) => challenge._statusSuper == "active")
    );
  }

  getNormalChallenges(type: string): BehaviorSubject<any[]> {
    if (type == "_status") return this.statusChallenges$;
    else return this.statusSuperChallenges$;
  }

  
  getDaysOfTheWeek(startDay: string, numberOfDays: number) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let count = 0;
    const daysArrayToReturn: string[] = [];
    let isFound = false;

    days.forEach((day) => {
      if (!isFound) {
        if (startDay === day && count < numberOfDays) {
          isFound = true;
          daysArrayToReturn.push(day);
          count += 1;
        }
      } else if (isFound && count < numberOfDays) {
        daysArrayToReturn.push(day);
        count += 1;
      }
    });
    return daysArrayToReturn;
  }

  async getActiveChallengeVideosData() {
    let challengeDays: any = [];
    try {
      const challengeId = this.challengeDatas[this.selectedChallengeIndex].id;
      
      // Create query reference
      const videosRef = collection(
        this.afs,
        `challenges/${challengeId}/videos`
      );
      const q = query(videosRef, where("status", "==", "active"));
      
      // Get documents
      const querySnapshot = await getDocs(q);
      
       if (!querySnapshot.docs.length) {
      //  let challengeDaysData = await this.storage.get(challengeId);
       /*  if (challengeDaysData && challengeDaysData.length) {
          challengeDays = challengeDaysData;
        } */
      } else {
        challengeDays = querySnapshot.docs.map((doc) => doc.data());
      //  await this.storage.set(challengeId, challengeDays);
      } 
    } catch (error) {
     /*  let challengeDaysData = await this.storage.get(
        this.challengeDatas[this.selectedChallengeIndex].id
      );
      if (challengeDaysData && challengeDaysData.length) {
        challengeDays = challengeDaysData;
      } */
    }
  
    console.log("Working hereeeee", challengeDays);
  
    for (const doc of challengeDays) {
      this.assignToChallengeDay(doc);
    }
  }

  private assignToChallengeDay(tdata: { day: any; }) {
    switch (tdata.day) {
      case "1":
        this.challengeDay1 = tdata;
        break;
      case "2":
        this.challengeDay2 = tdata;
        break;
      case "3":
        this.challengeDay3 = tdata;
        break;
      case "4":
        this.challengeDay4 = tdata;
        break;
      case "5":
        this.challengeDay5 = tdata;
        break;
      case "6":
        this.challengeDay6 = tdata;
        break;
      case "7":
        this.challengeDay7 = tdata;
        break;
      case "8":
        this.challengeDay8 = tdata;
        break;
      case "9":
        this.challengeDay9 = tdata;
        break;
      case "10":
        this.challengeDay10 = tdata;
        break;
      case "11":
        this.challengeDay11 = tdata;
        break;
      case "12":
        this.challengeDay12 = tdata;
        break;
      case "13":
        this.challengeDay13 = tdata;
        break;
      case "14":
        this.challengeDay14 = tdata;
        break;
      case "15":
        this.challengeDay15 = tdata;
        break;
      case "16":
        this.challengeDay16 = tdata;
        break;
      case "17":
        this.challengeDay17 = tdata;
        break;
      case "18":
        this.challengeDay18 = tdata;
        break;
      case "19":
        this.challengeDay19 = tdata;
        break;
      case "20":
        this.challengeDay20 = tdata;
        break;
      case "21":
        this.challengeDay21 = tdata;
        break;
      case "22":
        this.challengeDay22 = tdata;
        break;
      case "23":
        this.challengeDay23 = tdata;
        break;
      case "24":
        this.challengeDay24 = tdata;
        break;
      case "25":
        this.challengeDay25 = tdata;
        break;
      case "26":
        this.challengeDay26 = tdata;
        break;
      case "27":
        this.challengeDay27 = tdata;
        break;
      case "28":
        this.challengeDay28 = tdata;
        break;
      case "29":
        this.challengeDay29 = tdata;
        break;
      case "30":
        this.challengeDay30 = tdata;
        break;
      default:
        break;
    }
  }

  async getChallengeVideosDataNew(id: string) {
    const videosRef = collection(this.afs, `challenges/${id}/videos`);
    const q = query(videosRef, where("status", "==", "active"));
    
    const challengeDays = await getDocs(q);
    
    let data = [];
    for (const doc of challengeDays.docs) {
      const tdata = doc.data();
      data.push(tdata);
    }
    return data;
  }

  getChallengeData(id: string): Observable<any[]> {
    const q = query(
      collection(this.afs, "challenges"),
      where("_id", "==", id)
    );
  
    return collectionData(q).pipe(take(1));
  }

}
