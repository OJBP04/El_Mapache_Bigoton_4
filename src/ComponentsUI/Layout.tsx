import { useRef, useState } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import type { MenuItem } from 'primereact/menuitem';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import type { Nullable } from "primereact/ts-helpers";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export default function SidebarDemo() {
    const toast = useRef<Toast>(null);
    const [date, setDate] = useState<Nullable<Date>>(null);

    const items: MenuItem[] = [
        { label: 'Agenda', icon: 'pi pi-calendar' },
        { label: 'Cátalogos', icon: 'pi pi-pen-to-square' , url: '/catalogos' },

    ];

    return (
        <div style={{ display: 'flex' }}>
            {/* Barra superior */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1rem',
                borderBottom: '1px solid #ccc',
                zIndex: 1000
            }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                    🦝 El Mapache Bigotón 💈
                </span>
                <i className="pi pi-bell" style={{ fontSize: '1.5rem' }}></i>
            </div>

            {/* Sidebar */}
            <div style={{
                width: '250px',
                borderRight: '1px solid #ccc',
                height: '100vh',
                overflowY: 'auto',
                position: 'fixed',
                top: '60px',
                left: 0,
                padding: '1rem'
            }}>
                <Toast ref={toast} />
                <PanelMenu model={items} style={{ width: '100%' }} />
            </div>

            {/* Contenido principal */}
            <div style={{
                flexGrow: 1,
                marginLeft: '-200px',
                marginTop: '60px',
                padding: '1rem'
            }}>
                <Calendar
                    value={date}
                    onChange={(e) => setDate(e.value)}
                    inline
                    showWeek
                    style={{
                        width: '700px',
                        height: '550px'
                    }}
                />
            </div>
        </div>
    );
}
