import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, collectionSnapshots, Firestore, orderBy, query } from '@angular/fire/firestore';
import { AuthService } from './auth';
import { map } from 'rxjs';
interface errorObject {
  error: any;
  activity: any;
  page: any;
  payload: any;
}
@Injectable({
  providedIn: 'root',
})
export class Logging {

 

  firestore = inject(Firestore);
  authService = inject(AuthService);

  logError(dataObject: errorObject) {
    //add in firestore collection called errors
    let data = {
      ...dataObject,
      userMail: this.authService.currentUser?.email || '',
      dateCreated: new Date(),
      logType: 'error'
    }
    const errorsRef = collection(this.firestore, 'justmove_logging');
    addDoc(errorsRef, data).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }

  logActivity(dataObject: any) {
    //add in firestore collection called activity
    let data = {
      ...dataObject,
      userMail: this.authService.currentUser?.email || '',
      dateCreated: new Date(),
      logType: 'activity'
    }
    const activityRef = collection(this.firestore, 'justmove_logging');
    addDoc(activityRef, data).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);  
    });
  }


  getActivity() {
    const aCollection = collection(this.firestore, 'justmove_logging');
    let q = query(aCollection, orderBy('dateCreated', 'desc'));
    let items$ = collectionData(q, { idField: 'id' });
    return items$;
  }
  
}
