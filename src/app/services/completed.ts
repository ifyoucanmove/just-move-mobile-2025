import { Injectable } from '@angular/core';
import { addDoc, collection, collectionSnapshots, doc,limit, Firestore, onSnapshot, orderBy, query, updateDoc, where, setDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Completed {
  
  constructor(private firestore: Firestore) {}

  public addNewData(values: any): Observable<any> {
    const colRef = collection(this.firestore, `completed`);
    return from(addDoc(colRef, values));
  }

  public updateData(id:string, values: any): Observable<any> {
    const docRef = doc(this.firestore, `completed/${id}`);
    return from(updateDoc(docRef, values));
  }

  public editData(id:string, values: any): Observable<any> {
    const docRef = doc(this.firestore, `completed/${id}`);
    return from(updateDoc(docRef, values));
  }

  public loadChallengeDayData(userId: string, day: string, challengeId: string, repeatCount: any) {
  
    const completedRef = collection(this.firestore, "completed");
    const q = query(completedRef,
      where("userId", "==", userId),
      where("day", "==", day),
      where("challengeId", "==", challengeId),
      where("repeatCount", "==", repeatCount)
    );
  
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
  }

  public loadChallengeWarmUpCoolDownData(userId:string, challengeId:string, category:string) {
  
      const completedRef = collection(this.firestore, "completed");
      const q = query(completedRef
        ,where("userId", "==", userId)
        ,where("challengeId", "==", challengeId)
        ,where("category", "==", category)
      );
    
      return collectionSnapshots(q).pipe(
        map((snapshots: any) =>
          snapshots.map((snapshot: any) => ({
            id: snapshot.id,
            ...snapshot.data()
          }))
        )
      );
  }

  public loadChallengeWeekData(userId:string, challengeId:string, repeatCount:number) {

    const completedRef = collection(this.firestore, 'completed');
    const q = query(completedRef, where("userId", "==", userId), where("challengeId", "==", challengeId), where("repeatCount", "==", repeatCount));
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
     


  }

  
  setDocument(collectionName : string, documentId : string, data : any){
    const docRef = doc(this.firestore, `${collectionName}/${documentId}`);
    return from(setDoc(docRef, data, {merge: true}));
  }

  updateMoodData(documentId:any,data:any){
    const docRef = doc(this.firestore, `completed/${documentId}`);
    return from(updateDoc(docRef, data));
  }

  getMoodData(userId: string){
    const completedRef = collection(this.firestore, "completed");
    const q = query(completedRef, where("userId", "==", userId), where("isEnergyDataAvailable", "==", true), orderBy('date', 'desc'));
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
  }

  lodAllMoodIndexData(userId: string) {
    const q = query(
      collection(this.firestore, "completed"),
      where("userId", "==", userId),
      orderBy("energyData", "desc")
    );
  
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
  }

  loadCategoryWatchData(userId: string, postId: string) {
    let array = ["recipes", "workouts"];
    
    const q = query(
      collection(this.firestore, "completed"),
      where("userId", "==", userId),
      where("postId", "==", postId),
      where("category", "in", array)
    );
  
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
  }

  public loadBYOComboData(userId: string, comboId: string) {
    const q = query(
      collection(this.firestore, "completed"),
      where("userId", "==", userId),
      where("comboId", "==", comboId),
      where("category", "==", 'byo-combo')
    );
  
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
  }
  loadProgramWatchData(userId: string, programId: string, repeatCount: any) {
    const q = query(
      collection(this.firestore, "completed"),
      where("userId", "==", userId),
      where("programId", "==", programId),
      where("repeatCount", "==", repeatCount)
    );
  
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
  }
}
