import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {


  private breadCrumb = new BehaviorSubject<MenuItem[]>([]);

  constructor(
  ) { }
  
  set breadCrumbItems(items: MenuItem[]){
    this.breadCrumb.next(items);
  }

  get breadCrumbItems(): Observable<MenuItem[]>{
    return this.breadCrumb.asObservable();
  }

}
