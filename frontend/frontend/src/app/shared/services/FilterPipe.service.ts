import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false // Opcional: Si quieres que se actualice automáticamente cuando cambien los datos.
})
@Injectable({
  providedIn: 'root' // Hace que Angular lo maneje como un servicio sin necesidad de providers manuales
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();
    return items.filter(item => item.nombre.toLowerCase().includes(searchText));
  }
}
