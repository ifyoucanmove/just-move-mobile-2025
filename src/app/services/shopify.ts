import { Injectable } from '@angular/core';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import * as _ from 'lodash';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { collection, collectionData, doc, docSnapshots, Firestore, getDoc, query, setDoc, where } from '@angular/fire/firestore';
import { Customer } from './customer';
import { User } from './user';
import { AuthService } from './auth';

export const ShopifyStores = {
  justMove: 'justMove',
  pejaAmari: 'pejaAmari',
  teamLashae: 'teamLashae',
  sayItLoud: 'sayItLoud'
};

export enum SHOPIFY_SORT_KEY {
  BEST_SELLING = 'BEST_SELLING',
  CREATED_AT = 'CREATED_AT',
  ID = 'ID',
  PRICE = 'PRICE',
  PRODUCT_TYPE = 'PRODUCT_TYPE',
  TITLE = 'TITLE',
  UPDATED_AT = 'UPDATED_AT',
  VENDOR = 'VENDOR',
}

interface IPageInfo {
  endCursor?: string;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string;
}

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

export class Shopify {
  selectedStore : string = 'justMove';
  client = createStorefrontApiClient(cred.justMove);
  pageInfo: IPageInfo = {};
  collectionsPageInfo : IPageInfo = {};
  cartItemsJustMove$ : BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  cartItemsPejaAmari$ : BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  cartItemsTeamLashae$ : BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  cartItemsSayItLoud$ : BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  cartTotalQuantity$ : BehaviorSubject<number> = new BehaviorSubject<number>(0);
  stateData : any = null;
  userDetails:any;

  constructor(
    private afs: Firestore,
    private customerService: Customer,
    private httpClient: HttpClient,
    private userService: User,
    private authService: AuthService
  ) {
    this.userService.userDetails$.subscribe((res) => {
      console.log(res);
      if (res) {
        this.userDetails = res;
        console.log('res', res);
      }
    });
  }

  updateStoreFrontClinet(storeId  :any) {
    this.client = createStorefrontApiClient(cred[storeId]);
  }


  loadCartItems(email: string) {    
    combineLatest([
      this.getCartItems(email, 'justMove'),
      this.getCartItems(email, 'pejaAmari'),
      this.getCartItems(email, 'teamLashae'),
      this.getCartItems(email, 'sayItLoud')
    ]).subscribe(([justMoveCart, pejaAmariCart, teamLashaeCart, sayItLoudCart]) => {      
      this.cartItemsJustMove$.next( justMoveCart ? justMoveCart.items || [] : []);
      this.cartItemsPejaAmari$.next(pejaAmariCart? pejaAmariCart.items || [] : []);
      this.cartItemsTeamLashae$.next(teamLashaeCart ? teamLashaeCart.items || [] : []);
      this.cartItemsSayItLoud$.next(sayItLoudCart ? sayItLoudCart.items || [] : []);
      
      const totalQuantity = this.calculateTotalQuantity([
        justMoveCart ? justMoveCart?.items || [] : [],
        pejaAmariCart? pejaAmariCart.items || [] : [],
        teamLashaeCart ? teamLashaeCart.items || [] : [],
        sayItLoudCart ? sayItLoudCart.items || [] : []
      ]);

      this.cartTotalQuantity$.next(totalQuantity);
    });
  }

   calculateTotalQuantity(carts: any[][]): number {
    console.log("CARTS PASSED", carts);
    
    return carts.reduce((total, cart) => {
      // const cartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
      const cartQuantity = cart.length;
      return total + cartQuantity;
    }, 0);
  }


  getCart(store: string) {
    switch(store) {
      case ShopifyStores.justMove:
        return this.cartItemsJustMove$.getValue();
      case ShopifyStores.pejaAmari:
        return this.cartItemsPejaAmari$.getValue();
      case ShopifyStores.teamLashae:
        return this.cartItemsTeamLashae$.getValue();
      case ShopifyStores.sayItLoud:
        return this.cartItemsSayItLoud$.getValue();
      default:
        return [];
    }
  }


  setCart(store: string, cartItems: any) {
    switch (store) {
      case ShopifyStores.justMove:
        this.cartItemsJustMove$.next(cartItems);
        break;
      case ShopifyStores.pejaAmari:
        this.cartItemsPejaAmari$.next(cartItems);
        break;
      case ShopifyStores.teamLashae:
        this.cartItemsTeamLashae$.next(cartItems);
        break;
      case ShopifyStores.sayItLoud:
        this.cartItemsSayItLoud$.next(cartItems);
        break;
      default:
        console.error('Invalid store:', store);
    }
  }
  

  getinventory(vendor: string) {
    const q = query(
      collection(this.afs, 'shopify_inventory'),
      where('vendor', '==', vendor)
    );
  
    return collectionData(q).pipe(
      map((res: any) => {
        const _data: any[] = [];
        _.each(res, (item) => {
          _.each(item.variants, (varient) => {
            _data.push({ ...varient, product: item });
          });
        });
        return _data;
      })
    );
  }

  /* getMyorders(email : string) {
    return this.afs
    .collection('shopify_orders', ref => ref.where('email', '==',email)) // Add appName condition if necessary
    .valueChanges()
    .pipe(
      switchMap(async (orders: any[]) => {
        const updatedOrders = await Promise.all(
          orders.map(async (order: any) => {
            const lineItems = await Promise.all(
              (order.line_items || []).map(async (lineItem: any) => {
                const variant = order.appName
                  ? await this.getProductVarientImage(order.appName, lineItem.product_id, lineItem.variant_id)
                  : {};
                return { ...lineItem, variant };
              })
            );
            return { ...order, line_items: lineItems };
          })
        );
        return updatedOrders;
      })
    );
  } */

  getMyorders(email: string) {
    const q = query(
      collection(this.afs, 'shopify_orders'),
      where('email', '==', email)
    );
  
    return collectionData(q).pipe(
      switchMap(async (orders: any[]) => {
        const updatedOrders = await Promise.all(
          orders.map(async (order: any) => {
            const lineItems = await Promise.all(
              (order.line_items || []).map(async (lineItem: any) => {
                const variant = order.appName
                  ? await this.getProductVarientImage(order.appName, lineItem.product_id, lineItem.variant_id)
                  : {};
                return { ...lineItem, variant };
              })
            );
            return { ...order, line_items: lineItems };
          })
        );
        return updatedOrders;
      })
    );
  }

  async getProductVarientImage(appName: string, productId: number, varientsId: number) {
    const query = `query getProductById($id: ID!) {
        product(id: $id) {
          title,
           variants(first: 250) {
                  edges {
                   node {
                     title
                     id
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
}`; 

    const { data, errors, extensions } = await createStorefrontApiClient(cred[appName]).request(query, {
      variables: {
        id: `gid://shopify/Product/${productId}`,
      },
    });
    const find = _.find(_.get(data, 'product.variants.edges', []), (item) => {
        return _.get(item, 'node.id') == `gid://shopify/ProductVariant/${varientsId}`
    })
    if (find) {
      return find;
    }
    return { errors, extensions };
  }

  async getGraphqlQuery(type?: 'next' | 'previous' | '', id?: string, sortBy?: SHOPIFY_SORT_KEY) {
    const payload: any = {
      after: '',
      before: '',
      first: 10,
    };
    let query = '';
    let query1 = '';

    if (type == 'next' && this.pageInfo.hasNextPage) {
      payload['after'] = id;
      query += ', $after: String';
      query1 = ', after: $after';
    }
    if (type == 'previous' && this.pageInfo.hasPreviousPage) {
      payload['before'] = id;
      query += ', $before: String';
      query1 = ', after: $after';
    }


    if(sortBy) {
      payload['sortKey']=sortBy
      query += ', $sortKey: ProductSortKeys';
      query1 = ', sortKey: $sortKey';
    }


    const productQuery = `
    query ProductQuery($first: Int ${query ? query : ''}) {
      products (first: $first ${query1 ? query1 : ''}) {
        edges {
            node {
                id
                title
                availableForSale
                variants(first: 250) {
                  edges {
                   node {
                     title
                     id
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
        pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
         }
        }
    }
  `;
    const { data, errors, extensions } = await this.client.request(
      productQuery,
      {
        variables: payload,
      }
    );
    console.log(data, payload, errors);
    this.pageInfo = (data && data.products.pageInfo) || [];
    let productsData = (data && data.products.edges) || [];
    const _data: any[] = [];
    _.each(productsData, (item) => {
      _.each(item.node.variants.edges, (varient) => {
        _data.push({ ...varient.node, product: item.node });
      });
    });
    productsData = _data;
    return productsData;
  }


  async addToCartsFb(items: any, store : string) {

    let ref = doc(this.afs, `my_cart/${this.authService.userDetails.email}-${store}`);
   return await setDoc(ref, { items: items });
   /*  return await this.afs
      .collection('my_cart')
      .doc(`${this.userDetails.email}-${store}`)
      .set({ items: items }); */
  }

  // getCartItemsFb() {
  //   console.log(this.customerService.email);
  //   return this.afs.collection('my_cart').doc(this.customerService.email).get();
  // }

  getCartItems(email: string, store: string) {
    console.log("EMAIL LOADING", email);
    
    const docRef = doc(this.afs, `my_cart/${email}-${store}`);
    
    return docSnapshots(docRef).pipe(
      map((snapshot: any) => {
        return snapshot.data();
      })
    );
  }





  async createCheckoutId(items: any[], email : string) {
    const checkoutQuery = `mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        userErrors {
          code
          field
        }
        cart {
          id
          checkoutUrl
          cost {
            subtotalAmount {
                amount
            }
            totalAmount {
              amount
            }
            totalTaxAmount {
              amount
            }
          }
        }
      }
    }`;
    const { data, errors, extensions } = await this.client.request(
      checkoutQuery,
      {
        variables: {
          input: {
            buyerIdentity: {
              email: email,
            },
            attributes: [{ key: 'email', value: email}],
            lines: items,
            discountCodes:
            this.customerService.customerSubscribed$.value
              ? ['KCW7J5JK9D89']
              : [],
          },
        },
      }
    );
    if (data && data.cartCreate.cart.id) {
      return data;
    }
    return { errors, extensions };
  }


  async getAllProducts(sortBy: SHOPIFY_SORT_KEY = SHOPIFY_SORT_KEY.BEST_SELLING, sortOrder?: 'ASC' | 'DESC',  title: string = '', type?: 'next' | 'previous' | '', id?: string) {
    const payload: any = {
      after: '',
      before: '',
      first: 30,
    };
    let query = '';
    let query1 = '';

    
  
    if (sortBy) {
      payload['sortKey'] = sortBy;
      query += ', $sortKey: ProductSortKeys';
      query1 = ', sortKey: $sortKey';
    }

    if (sortOrder) {
      payload['reverse'] = sortOrder === 'DESC';
      query += ', $reverse: Boolean';
      query1 += ', reverse: $reverse';
    }

    if (type == 'next' && this.pageInfo.hasNextPage) {
      payload['after'] = id;
      query += ', $after: String';
      query1 += ', after: $after';
    }
    if (type == 'previous' && this.pageInfo.hasPreviousPage) {
      payload['before'] = id;
      query += ', $before: String';
      query1 += ', after: $after';
    }

    if (title) {
      payload['query'] = `title:*${title}*`; // Adding title search to the query parameter
      query += ', $query: String';
      query1 += ', query: $query';
    }
  
    const productQuery = `
      query AllProductsQuery( ${query ? query : ''}) {
        products(first: 30 ${query1 ? query1 : ''}) {
          edges {
            node {
              id
              title
              descriptionHtml
              availableForSale
              variants(first: 30) {
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
             pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
         }
        }
      }
    `;
  
    try {
      const { data, errors } = await this.client.request(productQuery, { variables: payload });
  
      if (errors) {
        console.error('GraphQL Errors:', errors);
        throw new Error('Failed to fetch products');
      }
      this.pageInfo = (data && data.products.pageInfo) || [];
      let productsData = (data && data.products.edges) || [];
  
      // Map over products and attach their variants within the product object itself
      const mappedProducts = _.map(productsData, (item) => {
        const product = {
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
        };
        return product;
      });
  
      return mappedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getCollections() {
    const collectionsQuery = `query {
      collections(first: 250, sortKey: UPDATED_AT ) {
        edges {
          node {
            id
            title
            updatedAt
            image {
              url
            }
          }
        }
      }
    }`;

    const { data, errors, extensions } = await this.client.request(
      collectionsQuery,
      {
        variables: {},
      }
    );
    if (data) {
      let collection = _.get(data, 'collections.edges', []).filter(
        (item: any) => item.node.image
      );
      return collection;
    }
    if (errors) {
      console.log(errors);
    }
  }

  async getCollection(
    collectionId: string,
    sortBy: SHOPIFY_SORT_KEY = SHOPIFY_SORT_KEY.BEST_SELLING, sortOrder?: 'ASC' | 'DESC',  type?: 'next' | 'previous' | '', id?: string
  ) {
    let payload: any = {
      after: '',
      before: '',
      first: 30,
    };

    let query = '';
    let query1 = '';

    if (sortBy) {
      payload['sortKey'] = sortBy;
      query += ', $sortKey: ProductCollectionSortKeys';
      query1 += ', sortKey: $sortKey';
    }

    if (sortOrder) {
      payload['reverse'] = sortOrder === 'DESC';
      query += ', $reverse: Boolean';
      query1 += ', reverse: $reverse';
    }


    if (type == 'next' && this.collectionsPageInfo.hasNextPage) {
      payload['after'] = id;
      query += ', $after: String';
      query1 += ', after: $after';
    }
    if (type == 'previous' && this.collectionsPageInfo.hasPreviousPage) {
      payload['before'] = id;
      query += ', $before: String';
      query1 += ', after: $after';
    }
    
    // if (title) {
    //   payload['query'] = `title:*${title}*`; // Adding title search to the query parameter
    //   query += ', $query: String';
    //   query1 += ', query: $query';
    // }

    const productQuery = `products(first: $first ${query1 ? query1 : ''}) {
            edges {
              node {
                id
                title
                availableForSale
                productType
                isGiftCard
                tags
                variants(first: 30) {
                  edges {
                   node {
                     title
                     id
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
            pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
         }
          }`;

    const collectionQuery = `
    query getCollectionById($id: ID!, $first: Int ${query ? query : ''}) {
      collection(id: $id) {
        title
        ${productQuery}
      }
    }`;
    if (collectionId) {
      payload['id'] = collectionId;
    }
    console.log(collectionQuery)


    try {
      const { data, errors, extensions } = await this.client.request(
        collectionQuery,
        {
          variables: payload,
        }
      );
      if (data) {
        console.log("DATA ", data);
        this.collectionsPageInfo = (data && data?.collection?.products?.pageInfo) || [];
        let productsData = (data && data?.collection?.products?.edges) || [];
  
      // Map over products and attach their variants within the product object itself
      const mappedProducts = _.map(productsData, (item) => {
        const product = {
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
        };
        return product;
      });
  
      return mappedProducts;
      }
      if (errors) {
        console.log('collectionId', collectionQuery, errors);
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
   
  }

  async updateShopifyCustomer(email: string, store: string, isActive: boolean) {
    //add bearer token to the request
    const token = await this.authService.getToken();
    return this.httpClient
      .get(
        `https://us-central1-ifyoucanmove-dev.cloudfunctions.net/updateShopifyCustomer?email=${email}&store=${store}&isActive=${isActive}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .toPromise();
  }
}  
