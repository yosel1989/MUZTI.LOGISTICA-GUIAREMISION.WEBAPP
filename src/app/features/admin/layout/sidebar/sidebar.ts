import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { GuiaRemisionRoutingModule } from "../../pages/guia-remision/guia-remision-routing.module";


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  imports: [PanelMenuModule, GuiaRemisionRoutingModule],
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy{

    items: MenuItem[] = [];

    constructor() {
    }

    ngOnInit(): void {
       this.items = [
            {
                label: 'Files',
                icon: 'pi pi-file',
                items: [
                    {
                        label: 'Documents',
                        icon: 'pi pi-file',
                        items: [
                            {
                                label: 'Invoices',
                                icon: 'pi pi-file-pdf',
                                items: [
                                    {
                                        label: 'Pending',
                                        icon: 'pi pi-stop'
                                    },
                                    {
                                        label: 'Paid',
                                        icon: 'pi pi-check-circle'
                                    }
                                ]
                            },
                            {
                                label: 'Clients',
                                icon: 'pi pi-users'
                            }
                        ]
                    },
                    {
                        label: 'Images',
                        icon: 'pi pi-image',
                        items: [
                            {
                                label: 'Logos',
                                icon: 'pi pi-image'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Cloud',
                icon: 'pi pi-cloud',
                items: [
                    {
                        label: 'Upload',
                        icon: 'pi pi-cloud-upload'
                    },
                    {
                        label: 'Download',
                        icon: 'pi pi-cloud-download'
                    },
                    {
                        label: 'Sync',
                        icon: 'pi pi-refresh'
                    }
                ]
            },
            {
                label: 'Devices',
                icon: 'pi pi-desktop',
                items: [
                    {
                        label: 'Phone',
                        icon: 'pi pi-mobile'
                    },
                    {
                        label: 'Desktop',
                        icon: 'pi pi-desktop'
                    },
                    {
                        label: 'Tablet',
                        icon: 'pi pi-tablet'
                    }
                ]
            }
        ]
    }

    ngAfterViewInit(): void {
        this.init();
    }

    ngOnDestroy(): void {
    }

    // functions
    init(): void{
        // Toggle the visibility of a dropdown menu
        const toggleDropdown = (dropdown: any, menu: any, isOpen: any) => {
            dropdown.classList.toggle("open", isOpen);
            menu.style.height = isOpen ? `${menu.scrollHeight}px` : 0;
            menu.style.minHeight = isOpen ? `${menu.scrollHeight}px` : 0;
            menu.style.paddingTop = isOpen ? `10px` : 0;
            menu.style.paddingBottom = isOpen ? `10px` : 0;
        };
        // Close all open dropdowns
        const closeAllDropdowns = () => {
            document.querySelectorAll(".dropdown-container.open").forEach((openDropdown) => {
                toggleDropdown(openDropdown, openDropdown.querySelector(".dropdown-menu"), false);
            });
        };
        // Attach click event to all dropdown toggles
        document.querySelectorAll(".dropdown-toggle").forEach((dropdownToggle) => {
            dropdownToggle.addEventListener("click", (e) => {
                e.preventDefault();
                const dropdown = dropdownToggle.closest(".dropdown-container");
                const menu = dropdown?.querySelector(".dropdown-menu");
                const isOpen = dropdown?.classList.contains("open");
                closeAllDropdowns(); // Close all open dropdowns
                toggleDropdown(dropdown, menu, !isOpen); // Toggle current dropdown visibility
            });
        });
        // Attach click event to sidebar toggle buttons
        document.querySelectorAll(".sidebar-toggler, .sidebar-menu-button").forEach((button) => {
            button.addEventListener("click", () => {
                closeAllDropdowns(); // Close all open dropdowns
                document.querySelector(".sidebar")?.classList.toggle("collapsed"); // Toggle collapsed class on sidebar
            });
        });
        // Collapse sidebar by default on small screens
        if (window.innerWidth <= 1024) document.querySelector(".sidebar")?.classList.add("collapsed");
    }

}
