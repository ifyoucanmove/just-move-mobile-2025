import { Injectable } from '@angular/core';
import { addDoc, collection, query, collectionSnapshots, deleteDoc, doc, Firestore, orderBy, where } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { LocalStorage } from './local-storage';

@Injectable({
  providedIn: 'root',
})
export class Favorites {
  
  favorites$!: Observable<any[]>;
  favorites: any[] = [];

  constructor(
    private firestore: Firestore,
    private localStorage: LocalStorage
  ) {}

  addFavoriteItem(data: any) {
    return new Observable<any>((observer) => {
      const colRef = collection(this.firestore, `favorites`);
      addDoc(colRef, data).then(
        (res) => {
          console.log(res.id);
  
          observer.next(res);
          observer.complete();
        },
        (err) => {
          observer.error(err);
        }
      );
    });
  }
  deleteFavoriteItem(id: string) {
    return new Observable<any>((observer) => {
      const docRef = doc(this.firestore, `favorites/${id}`);
      deleteDoc(docRef).then(
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

  getFavorites(email: string): Observable<any[]> {
    this.favorites$ = this.arrayCheckFavorites(email);
    this.favorites$.subscribe((data) => (this.favorites = data));
    return this.favorites$;
  }

  private arrayCheckFavorites(email: string): Observable<any[]> {
    const key = "fav::" + email;
    let ob$: Observable<any[]>;
    ob$ = this.getFavoritesFromFirebase(email);
    ob$.subscribe((data) => {
      this.localStorage.set(key, data);
    });
    return ob$;
  }

  private getFavoritesFromFirebase(email: string): Observable<any[]> {
    const favoritesRef = collection(this.firestore, "favorites");
    const q = query(favoritesRef, where("email", "==", email.toLowerCase()), orderBy('dateCreated', 'desc'));
  
    return collectionSnapshots(q).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => {
          const data = snapshot.data() as any;
          const id = snapshot.id;
          return { id, ...this.reduceToListData(data) };
        })
      )
    );
  }

  // Reducing returned data to only show necessary data
  private reduceToListData(data: any) {
    const returnedData = {
      day: data.day,
      challengeId: data.challengeId,
      email: data.email,
      type: data.type,
      dateCreated: data.dateCreated || null,
      title: data.title || null,
      image: data.image || null,
      description: data.description || null,
      equipment: data.equipment || null,
      duration: data.duration || null,
      durationMinutes: data.durationMinutes || null,
      ingredients: data.ingredients || null,
      categories: data.categories || null,
      categoryArray: data.categoryArray || null,
      postId: data.postId || null
    };
    return returnedData;
  }
}

