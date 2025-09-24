import { Menubar } from 'primereact/menubar';
import type {MenuItem} from 'primereact/menuitem';

export default function headBarberoComponent() {
    const items: MenuItem[] = [
        {
            label: 'Inicio',
            icon: 'pi pi-home',
            url:'/'
        },
        {
            label: 'Barberos',
            icon: 'pi pi-users',
            url:'/barberos'
        },
    ];

    return (
        <div className="card">
            <Menubar model={items} />
        </div>
    )
}