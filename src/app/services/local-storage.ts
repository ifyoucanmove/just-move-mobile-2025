import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  allowLocalStorage: boolean;

  constructor() {
      this.allowLocalStorage = this.localStorageTest();
  }

  get(key: string, from?: string): any {
      if (this.allowLocalStorage) {
          try {
              const item = localStorage.getItem(key);
          return item ? JSON.parse(item) : null;
          } catch (error) {
              return null;
          }
      } else {
          return null;
      }
  }

  set(key: string, obj: any): boolean {
      if (this.allowLocalStorage) {
          try {
              localStorage.setItem(key, JSON.stringify(obj));
              return true; // Return true if the item is successfully set
          } catch (error) {
              return false; // Return false if an error occurs
          }
      } else {
          return false;
      }
  }    

  clear() {
      localStorage.clear();
  }

  private localStorageTest() {
      // https://ultimatecourses.com/blog/storing-data-in-the-browser-with-the-html5-local-storage-api
      return typeof (Storage) !== 'undefined';
  }
}
