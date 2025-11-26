import { Injectable } from '@angular/core';
import { collection, doc, Firestore, getDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Byo {
  
  constructor(private firestore: Firestore) {}

  getCombodetialsByID(comboId: string) {
    return new Observable<any>((observer) => {
      const docRef = doc(this.firestore, `byoCombos/${comboId}`);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          observer.next(snapshot.data() as any);
          observer.complete();
        },
        (err) => {
          observer.error(err);
        }
      );
      return () => unsubscribe();
    });
  }

  loadPostAsPromise(postId: string) {
    const docRef = doc(this.firestore,`posts/${postId}`);
    return getDoc(docRef);
  }

}
