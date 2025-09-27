import { useRef, useState, useEffect } from 'react';
import { PanelMenu } from 'primereact/panelmenu';
import type { MenuItem } from 'primereact/menuitem';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import type { Nullable } from "primereact/ts-helpers";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { classNames } from "primereact/utils";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import BarberoService from '../Services/BarberoService.tsx';
import ServicioService from '../Services/ServicioService.tsx';
import ClienteService from '../Services/ClienteService.tsx';
import CitaService from '../Services/CitaService.tsx';

interface Barbero {
    idBarbero: number | null;
    nombre: string;
}

interface Servicio {
    idServicio: number | null;
    descripcion: string;
    costo: number;
}

interface FormattedBarbero {
    idBarbero: number | null;
    nombreBarbero: string;
}

interface FormattedServicio {
    idServicio: number | null;
    nombreServicio: string;
}

interface Cliente {
    nombre: string;
    telefono: string;
}

export default function SidebarDemo() {
    const toast = useRef<Toast>(null);
    const [date, setDate] = useState<Nullable<Date>>(null);
    const [selectedDate, setSelectedDate] = useState<Nullable<Date>>(null);
    const [barberos, setBarberos] = useState<FormattedBarbero[]>([]);
    const [servicios, setServicios] = useState<FormattedServicio[]>([]);
    const [selectedBarbero, setSelectedBarbero] = useState<FormattedBarbero | null>(null);
    const [selectedServicio, setSelectedServicio] = useState<FormattedServicio | null>(null);
    const [cliente, setCliente] = useState<Cliente>({ nombre: '', telefono: '' });
    const [hora, setHora] = useState<Nullable<Date>>(null);
    const [submitted, setSubmitted] = useState<boolean>(false);

    const items: MenuItem[] = [
        { label: 'Agenda', icon: 'pi pi-calendar' },
        { label: 'Cátalogos', icon: 'pi pi-pen-to-square' , url: '/catalogos' },
    ];

    useEffect(() => {
        BarberoService.findAll().then((response) => {
            const barberosFormateados = response.data.map((b: Barbero) => ({
                idBarbero: b.idBarbero,
                nombreBarbero: b.nombre
            }));
            setBarberos(barberosFormateados);
        });

        ServicioService.findAll().then((response) => {
            const serviciosFormateados = response.data.map((s: Servicio) => ({
                idServicio: s.idServicio,
                nombreServicio: s.descripcion
            }));
            setServicios(serviciosFormateados);
        });
    }, []);

    const handleAgendarCita = async () => {
        setSubmitted(true);
        if (!selectedBarbero || !selectedServicio || !cliente.nombre.trim() || !cliente.telefono.trim() || !selectedDate || !hora) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor, complete todos los campos.',
                life: 3000
            });
            return;
        }

        try {
            const newClient = {
                nombre: cliente.nombre,
                telefono: cliente.telefono
            };
            const clientResponse = await ClienteService.create(newClient);
            const idCliente = clientResponse.data.idCliente;

            const nuevaCita = {
                barbero: { idBarbero: selectedBarbero.idBarbero },
                servicio: { idServicio: selectedServicio.idServicio },
                cliente: { idCliente: idCliente },
                fecha: selectedDate.toISOString().split('T')[0],
                hora: hora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            };

            await CitaService.create(nuevaCita);

            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cita agendada correctamente.',
                life: 3000
            });

            setSelectedBarbero(null);
            setSelectedServicio(null);
            setCliente({ nombre: '', telefono: '' });
            setSelectedDate(null);
            setHora(null);
            setSubmitted(false);

        } catch (error) {
            console.error("Error al agendar la cita:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo agendar la cita. Intente de nuevo.',
                life: 3000
            });
        }
    };

    return (
        <div style={{ display: 'flex' }}>
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

            <div style={{
                flexGrow: 1,
                marginLeft: '100px',
                marginTop: '60px',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '3rem',
            }}>
                <div style={{
                    width: '750px',
                    height: '560px'
                }}>
                    <Calendar
                        value={date}
                        onChange={(e) => {
                            setDate(e.value);
                            setSelectedDate(e.value);
                        }}
                        inline
                        showWeek
                        style={{
                            width: '100%',
                            height: '100%'
                        }}
                    />
                </div>

                <div style={{
                    width: '320px',
                }}>
                    <Card title="Nueva Cita">
                        <div style={{ padding: '0.5rem' }}>
                            <div className="p-field" style={{marginBottom: '0.5rem'}}>
                                <label htmlFor="barbero" className="p-label" style={{ fontWeight: 'bold' }}>Barbero</label>
                                <Dropdown
                                    id="barbero"
                                    value={selectedBarbero}
                                    onChange={(e) => setSelectedBarbero(e.value)}
                                    options={barberos}
                                    optionLabel="nombreBarbero"
                                    placeholder="Selecciona un barbero"
                                    className={classNames({'p-invalid': submitted && !selectedBarbero})}
                                    style={{ width: '100%' }}
                                />
                                {submitted && !selectedBarbero && <small className="p-error">El barbero es requerido.</small>}
                            </div>

                            <div className="p-field" style={{marginBottom: '0.5rem'}}>
                                <label htmlFor="servicio" className="p-label" style={{ fontWeight: 'bold' }}>Servicio</label>
                                <Dropdown
                                    id="servicio"
                                    value={selectedServicio}
                                    onChange={(e) => setSelectedServicio(e.value)}
                                    options={servicios}
                                    optionLabel="nombreServicio"
                                    placeholder="Selecciona un servicio"
                                    className={classNames({'p-invalid': submitted && !selectedServicio})}
                                    style={{ width: '100%' }}
                                />
                                {submitted && !selectedServicio && <small className="p-error">El servicio es requerido.</small>}
                            </div>

                            <div className="p-field" style={{marginBottom: '0.5rem'}}>
                                <label htmlFor="nombreCliente" className="p-label" style={{ fontWeight: 'bold' }}>Nombre del Cliente</label>
                                <InputText
                                    id="nombreCliente"
                                    value={cliente.nombre}
                                    onChange={(e) => setCliente({...cliente, nombre: e.target.value})}
                                    placeholder="Nombre del cliente"
                                    className={classNames({'p-invalid': submitted && !cliente.nombre.trim()})}
                                    style={{ width: '100%' }}
                                />
                                {submitted && !cliente.nombre.trim() && <small className="p-error">El nombre es requerido.</small>}
                            </div>

                            <div className="p-field" style={{marginBottom: '0.5rem'}}>
                                <label htmlFor="telefono" className="p-label" style={{ fontWeight: 'bold' }}>Teléfono del Cliente</label>
                                <InputText
                                    id="telefono"
                                    type="tel"
                                    value={cliente.telefono}
                                    onChange={(e) => setCliente({...cliente, telefono: e.target.value})}
                                    placeholder="Teléfono del cliente"
                                    className={classNames({'p-invalid': submitted && !cliente.telefono.trim()})}
                                    style={{ width: '100%' }}
                                />
                                {submitted && !cliente.telefono.trim() && <small className="p-error">El teléfono es requerido.</small>}
                            </div>

                            <div className="p-field" style={{marginBottom: '0.5rem'}}>
                                <label htmlFor="fecha" className="p-label" style={{ fontWeight: 'bold' }}>Fecha de la Cita</label>
                                <Calendar
                                    id="fecha"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.value)}
                                    dateFormat="dd/M/yy"
                                    readOnlyInput
                                    className={classNames({'p-invalid': submitted && !selectedDate})}
                                    style={{ width: '100%' }}
                                />
                                {submitted && !selectedDate && <small className="p-error">La fecha es requerida.</small>}
                            </div>

                            <div className="p-field" style={{marginBottom: '0.5rem'}}>
                                <label htmlFor="hora" className="p-label" style={{ fontWeight: 'bold' }}>Hora de la Cita</label>
                                <Calendar
                                    id="hora"
                                    value={hora}
                                    onChange={(e) => setHora(e.value)}
                                    timeOnly
                                    hourFormat="12"
                                    className={classNames({'p-invalid': submitted && !hora})}
                                    style={{ width: '100%' }}
                                />
                                {submitted && !hora && <small className="p-error">La hora es requerida.</small>}
                            </div>

                            <div className="text-center" style={{paddingTop: '0.5rem'}}>
                                <Button
                                    label="Agendar Cita"
                                    icon="pi pi-check"
                                    onClick={handleAgendarCita}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}