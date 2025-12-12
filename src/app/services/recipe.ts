import { Injectable } from '@angular/core';
import { collection, collectionData, collectionSnapshots, doc, docSnapshots, Firestore, orderBy, query, where } from '@angular/fire/firestore';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
 

constructor(
 public firestore: Firestore
) {
}

/* get all recipes */

getRecipes() {
  const aCollection = collection(this.firestore, 'recipes');
  let q = query(aCollection, orderBy('timestamp', 'desc'));
  
  let items$ = collectionData(q, { idField: 'id' });
  console.log('q', items$);
  return items$;
}

getRecipeById(id:string) {
  const docRef = doc(this.firestore, `recipes/${id}`);
  return docSnapshots(docRef).pipe(
    map((snapshot: any) => {
      return snapshot.data();
    })
  );

  }

getRecipeByCategory(category: string) {
  const recipesRef = collection(this.firestore, 'recipes');
  const q = query(recipesRef, where('category', '==', category));
  return collectionSnapshots(q).pipe(
    map((snapshots: any) =>
      snapshots.map((snapshot: any) => ({
        id: snapshot.id,
        ...snapshot.data()
      }))
    ))
  }

  public getallRecipe() {
    
    const recipesRef = collection(this.firestore, "recipes");
    
  
    return collectionSnapshots(recipesRef).pipe(
      map((snapshots: any) =>
        snapshots.map((snapshot: any) => ({
          id: snapshot.id,
          ...snapshot.data()
        }))
      )
    );
}

}
