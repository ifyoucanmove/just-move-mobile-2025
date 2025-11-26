import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  
  constructor(private firestore: Firestore) {}

  deleteDocument(collectionName: string, documentId: string) {
    return new Observable<any>((observer) => {
      const docRef = doc(this.firestore, `${collectionName}/${documentId}`);
      deleteDoc(docRef).then(res => {
        observer.next(true);
        observer.complete();
      }).catch(err => {
        observer.error(err);
      });
    });
  }
}
