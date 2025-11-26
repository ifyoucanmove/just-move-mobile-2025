import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { collection, collectionSnapshots, Firestore, onSnapshot, query, where } from '@angular/fire/firestore';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class User {
  userDetails$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  email: string = "";
  constructor(
    public afs: Firestore, public afAuth: Auth
  ) { }

  public getUserByEmail(email : string){

    const usersRef = collection(this.afs, 'users');

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

  public getUserDetailsById(uid : string) {

    const usersRef = collection(this.afs, 'users');
    const q = query(usersRef, where('uid', '==', uid));
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
