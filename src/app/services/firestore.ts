import { Injectable } from '@angular/core';
import { deleteDoc, doc, Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  
  constructor(private firestore: Firestore) {}

  deleteDocument(collectionName: string, documentId: string) {
    console.log("collectionName", collectionName);
    console.log("documentId", documentId);
    return new Observable<any>((observer) => {
      const docRef = doc(this.firestore, `${collectionName}/${documentId}`);
      deleteDoc(docRef).then(res => {
        console.log("res", res);
        observer.next(true);
        observer.complete();
      }).catch(err => {
        console.log("err", err);
        observer.error(err);
      });
    });
  }
}
