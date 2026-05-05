import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { MultiSelectModule } from 'primeng/multiselect';

interface City {
    name: string;
    code: string;
}


@Component({
    selector: "app-page-permiso-principal",
    templateUrl: "./page-permiso-principal.html",
    styleUrls: ["./page-permiso-principal.scss"],
    imports: [
        MultiSelectModule,
        CardModule,
        DividerModule
    ]
})

export class PagePermisoPrincipalComponent implements OnInit, AfterViewInit, OnDestroy{

    cities!: City[];

    ngOnInit(): void {
        this.cities = [
            { name: 'New York', code: 'NY' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' },
            { name: 'Berlin', code: 'BLN' },
            { name: 'Barcelona', code: 'BCN' },
            { name: 'Madrid', code: 'MAD' },
            { name: 'Moscow', code: 'MOW' },
            { name: 'Tokyo', code: 'TKY' },
            { name: 'Dubai', code: 'DXB' },
            { name: 'Singapore', code: 'SIN' },
            { name: 'Hong Kong', code: 'HKG' },
            { name: 'Sydney', code: 'SYD' },
            { name: 'Los Angeles', code: 'LA' },
            { name: 'Chicago', code: 'CHI' },
            { name: 'Toronto', code: 'TOR' },
            { name: 'San Francisco', code: 'SF' },
            { name: 'Miami', code: 'MIA' },
            { name: 'Seoul', code: 'SEL' },
            { name: 'Bangkok', code: 'BKK' },
            { name: 'Vienna', code: 'VIE' },
            { name: 'Prague', code: 'PRG' },
            { name: 'Dublin', code: 'DUB' },
            { name: 'Brussels', code: 'BRU' },
        ];
    }

    ngAfterViewInit(): void {
        console.log("PagePermisoPrincipalComponent: ngAfterViewInit");
    }

    ngOnDestroy(): void {
        console.log("PagePermisoPrincipalComponent: ngOnDestroy");
    }

}