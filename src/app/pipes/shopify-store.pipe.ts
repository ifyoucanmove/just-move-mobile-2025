import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shopifyStore',
  standalone: true
})
export class ShopifyStorePipe implements PipeTransform {

  transform(store: string): string {
    switch (store) {
      case 'justMove':
        return 'Just Move';
      case 'pejaAmari':
        return 'Peja Amari';
      case 'teamLashae':
        return 'Team Lashea';
      case 'sayItLoud':
        return 'Say It Loud';
      default:
        return 'Just Move';
    }
  }

}
