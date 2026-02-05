import { Injectable } from '@angular/core';
import { collection, collectionData, collectionSnapshots, doc, docSnapshots, Firestore, orderBy, query, where } from '@angular/fire/firestore';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { map } from 'rxjs';
const cred: any = {
  justMove: {
    storeDomain: 'just-move-supplements.myshopify.com',
    apiVersion: '2025-04',
    publicAccessToken: '792053bac459ec82873acc350433d89f',
  },
  pejaAmari: {
    storeDomain: 'pejaandamari.myshopify.com',
    apiVersion: '2025-04',
    publicAccessToken: 'dad052ddf6c3e85730e72ab7860fd192',
  },
  teamLashae: {
    storeDomain: 'teamlashae.myshopify.com',
    apiVersion: '2025-04',
    publicAccessToken: '62111e3c3f73b01a4ec4d183cc413898',
  },
  sayItLoud: {},
  testApp: {
    storeDomain: '9de471-3f.myshopify.com',
    apiVersion: '2025-04',
    publicAccessToken: 'd5de965f01858b50b9e6fef424f0b68a',
  },
};
@Injectable({
  providedIn: 'root',
})
export class RecipeService {
 
  client = createStorefrontApiClient(cred.justMove);

  swiperRecipes:any[] = [];
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

getShopifyInventory(ids:any) {
  console.log('ids', ids);
  const shopifyInventoryRef = collection(this.firestore, 'shopify_inventory');
  const q = query(shopifyInventoryRef, where('id', 'in', ids));
  return collectionData(q).pipe(
    map((res: any) => {
      return res;
    })
  );
  }

  addShopifyProductGid(productIds:any) {
    const prefix = "gid://shopify/Product/";
    return productIds.map((id:any) => `${prefix}${id}`);
  }

  async getAllProducts(ids:any) {
    const productQuery = `
      query {
        products(first: 250) {
          edges {
            node {
              id
              title
              descriptionHtml
              availableForSale
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
  
    try {
      const { data, errors } = await this.client.request(productQuery);
  
      if (errors) {
        console.error('GraphQL Errors:', errors);
        throw new Error('Failed to fetch products');
      }
  
      const productsData = data?.products?.edges || [];
  
      //i have array of ids, i want to filter the productsData with the ids
      console.log(productsData,'filteredProducts');
      let graphId = this.addShopifyProductGid(ids)
      console.log(graphId,'graphId');
      const filteredProducts = productsData.filter((item: any) => graphId.includes(item.node.id));
      console.log(filteredProducts,'filteredProducts');
      const mappedProducts = filteredProducts.map((item: any) =>
         ({
        id: item.node.id,
        title: item.node.title,
        descriptionHtml: item.node.descriptionHtml,
        availableForSale: item.node.availableForSale,
        variants: item.node.variants.edges.map((variant: any) => ({
          id: variant.node.id,
          title: variant.node.title,
          availableForSale: variant.node.availableForSale,
          price: variant.node.price,
          image: variant.node.image,
        })),
      })
    );
  
      return mappedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
  
  
  
}
