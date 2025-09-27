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
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
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

interface Cita {
    idCita: number;
    fecha: string;
    hora: string;
    barbero: {
        idBarbero: number;
        nombre: string;
    };
    cliente: {
        idCliente: number;
        nombre: string;
        telefono: string;
    };
    servicio: {
        idServicio: number;
        descripcion: string;
        costo: number;
    };
}

interface CalendarDate {
    day: number;
    month: number;
    year: number;
    today: boolean;
    selectable: boolean;
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

    const [citas, setCitas] = useState<Cita[]>([]);
    const [citasDelDia, setCitasDelDia] = useState<Cita[]>([]);
    const [showCitasDialog, setShowCitasDialog] = useState<boolean>(false);
    const [fechasConCitas, setFechasConCitas] = useState<string[]>([]);

    const items: MenuItem[] = [
        { label: 'Agenda', icon: 'pi pi-calendar' },
        { label: 'Cátalogos', icon: 'pi pi-pen-to-square' , url: '/catalogos' },
    ];

    const loadCitas = async () => {
        try {
            const response = await CitaService.findAll();
            if (response && response.data && Array.isArray(response.data)) {
                setCitas(response.data);
                const fechas = [...new Set(response.data.map((cita: Cita) => cita.fecha))];
                setFechasConCitas(fechas);
            } else {
                setCitas([]);
                setFechasConCitas([]);
            }
        } catch (error) {
            console.error("Error al cargar las citas:", error);
            setCitas([]);
            setFechasConCitas([]);
        }
    };

    useEffect(() => {
        const loadBarberosAndServicios = async () => {
            try {
                const [barberosResponse, serviciosResponse] = await Promise.all([
                    BarberoService.findAll(),
                    ServicioService.findAll()
                ]);

                if (Array.isArray(barberosResponse.data)) {
                    const barberosFormateados = barberosResponse.data.map((b: Barbero) => ({
                        idBarbero: b.idBarbero,
                        nombreBarbero: b.nombre
                    }));
                    setBarberos(barberosFormateados);
                } else {
                    setBarberos([]);
                }

                if (Array.isArray(serviciosResponse.data)) {
                    const serviciosFormateados = serviciosResponse.data.map((s: Servicio) => ({
                        idServicio: s.idServicio,
                        nombreServicio: s.descripcion
                    }));
                    setServicios(serviciosFormateados);
                } else {
                    setServicios([]);
                }

            } catch (error) {
                console.error("Error al cargar los datos iniciales:", error);
                setBarberos([]);
                setServicios([]);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los datos iniciales.',
                    life: 5000
                });
            }
        };

        loadBarberosAndServicios();
        loadCitas();
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

            await loadCitas();

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

    const dateTemplate = (date: CalendarDate) => {
        const fechaString = `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
        const tieneCitas = fechasConCitas.includes(fechaString);

        return (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <span>{date.day}</span>
                {tieneCitas && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#10b981',
                            borderRadius: '50%',
                            border: '1px solid white'
                        }}
                    />
                )}
            </div>
        );
    };

    const handleDateSelect = (e: { value: Nullable<Date> }) => {
        const fechaSeleccionada = e.value;
        setDate(fechaSeleccionada);
        setSelectedDate(fechaSeleccionada);

        if (fechaSeleccionada) {
            const fechaString = fechaSeleccionada.toISOString().split('T')[0];
            const citasDelDiaSeleccionado = citas.filter(cita => cita.fecha === fechaString);

            if (citasDelDiaSeleccionado.length > 0) {
                setCitasDelDia(citasDelDiaSeleccionado);
                setShowCitasDialog(true);
            }
        }
    };

    const horaBodyTemplate = (rowData: Cita) => {
        return <span>{rowData.hora}</span>;
    };

    const barberoBodyTemplate = (rowData: Cita) => {
        return <span>{rowData.barbero.nombre}</span>;
    };

    const clienteBodyTemplate = (rowData: Cita) => {
        return (
            <div>
                <div style={{ fontWeight: 'bold' }}>{rowData.cliente.nombre}</div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{rowData.cliente.telefono}</div>
            </div>
        );
    };

    const servicioBodyTemplate = (rowData: Cita) => {
        return (
            <div>
                <div>{rowData.servicio.descripcion}</div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>${rowData.servicio.costo}</div>
            </div>
        );
    };

    const citasDialogFooter = (
        <Button
            label="Cerrar"
            icon="pi pi-times"
            onClick={() => setShowCitasDialog(false)}
            className="p-button-text"
        />
    );

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
                        onChange={handleDateSelect}
                        inline
                        showWeek
                        dateTemplate={dateTemplate}
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

            <Dialog
                visible={showCitasDialog}
                style={{ width: '70vw', maxWidth: '900px' }}
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-calendar" style={{ color: '#10b981' }}></i>
                        <span style={{ color: '#333', fontWeight: '600' }}>
                            Citas del {selectedDate?.toLocaleDateString('es-MX')}
                        </span>
                    </div>
                }
                modal
                footer={citasDialogFooter}
                onHide={() => setShowCitasDialog(false)}
            >
                <DataTable
                    value={citasDelDia}
                    responsiveLayout="scroll"
                    emptyMessage="No hay citas para este día"
                >
                    <Column
                        field="hora"
                        header="Hora"
                        body={horaBodyTemplate}
                        style={{ minWidth: '100px' }}
                    />
                    <Column
                        field="barbero.nombre"
                        header="Barbero"
                        body={barberoBodyTemplate}
                        style={{ minWidth: '150px' }}
                    />
                    <Column
                        field="cliente"
                        header="Cliente"
                        body={clienteBodyTemplate}
                        style={{ minWidth: '180px' }}
                    />
                    <Column
                        field="servicio"
                        header="Servicio"
                        body={servicioBodyTemplate}
                        style={{ minWidth: '180px' }}
                    />
                </DataTable>
            </Dialog>
        </div>
    );
}