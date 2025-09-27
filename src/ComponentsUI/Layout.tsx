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
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
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

interface Cliente {
    nombre: string;
    telefono: string;
}

interface FormattedBarbero {
    idBarbero: number | null;
    nombreBarbero: string;
}

interface FormattedServicio {
    idServicio: number | null;
    nombreServicio: string;
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
    const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
    const [citaAEditar, setCitaAEditar] = useState<Cita | null>(null);
    const [editData, setEditData] = useState({
        barbero: null as FormattedBarbero | null,
        servicio: null as FormattedServicio | null,
        cliente: { nombre: '', telefono: '' },
        fecha: null as Nullable<Date>,
        hora: null as Nullable<Date>
    });

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

    const handleEditarCita = (cita: Cita) => {
        setCitaAEditar(cita);

        const barberoFormateado = barberos.find(b => b.idBarbero === cita.barbero.idBarbero);
        const servicioFormateado = servicios.find(s => s.idServicio === cita.servicio.idServicio);

        const fechaCita = new Date(cita.fecha + 'T00:00:00'); // Ajuste para evitar problemas de zona horaria

        const [horas, minutos] = cita.hora.split(':');
        const horaCita = new Date();
        horaCita.setHours(parseInt(horas), parseInt(minutos), 0, 0);

        setEditData({
            barbero: barberoFormateado || null,
            servicio: servicioFormateado || null,
            cliente: {
                nombre: cita.cliente.nombre,
                telefono: cita.cliente.telefono
            },
            fecha: fechaCita,
            hora: horaCita
        });

        setShowEditDialog(true);
    };

    const handleActualizarCita = async () => {
        if (!citaAEditar || !editData.barbero || !editData.servicio ||
            !editData.cliente.nombre.trim() || !editData.cliente.telefono.trim() ||
            !editData.fecha || !editData.hora) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor, complete todos los campos.',
                life: 3000
            });
            return;
        }

        try {
            const clienteActualizado = {
                idCliente: citaAEditar.cliente.idCliente,
                nombre: editData.cliente.nombre,
                telefono: editData.cliente.telefono
            };
            await ClienteService.update(clienteActualizado.idCliente, clienteActualizado);

            const citaActualizada = {
                idCita: citaAEditar.idCita,
                barbero: { idBarbero: editData.barbero.idBarbero },
                servicio: { idServicio: editData.servicio.idServicio },
                cliente: { idCliente: citaAEditar.cliente.idCliente },
                fecha: editData.fecha.toISOString().split('T')[0],
                hora: editData.hora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
            };

            const response = await CitaService.update(citaAEditar.idCita, citaActualizada);
            const citaActualizadaData = response.data;

            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Cita actualizada correctamente.',
                life: 3000
            });

            setShowEditDialog(false);
            setCitaAEditar(null);

            // Actualizar la lista de citas del día en el estado
            const citasDelDiaActualizadas = citasDelDia.map(c =>
                c.idCita === citaAEditar.idCita ? citaActualizadaData : c
            );
            setCitasDelDia(citasDelDiaActualizadas);
            await loadCitas();

        } catch (error) {
            console.error("Error al actualizar la cita:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo actualizar la cita. Intente de nuevo.',
                life: 3000
            });
        }
    };

    const handleEliminarCita = (cita: Cita) => {
        confirmDialog({
            message: `¿Está seguro de eliminar la cita de ${cita.cliente.nombre} a las ${cita.hora}?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            accept: async () => {
                try {
                    await CitaService.delete(cita.idCita);

                    toast.current?.show({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Cita eliminada correctamente.',
                        life: 3000
                    });

                    // Actualizar la lista de citas del día para reflejar la eliminación
                    const citasDelDiaActualizadas = citasDelDia.filter(c => c.idCita !== cita.idCita);
                    setCitasDelDia(citasDelDiaActualizadas);

                    // Recargar todas las citas para actualizar el calendario
                    await loadCitas();

                    if (citasDelDiaActualizadas.length === 0) {
                        setShowCitasDialog(false);
                    }

                } catch (error) {
                    console.error("Error al eliminar la cita:", error);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo eliminar la cita. Intente de nuevo.',
                        life: 3000
                    });
                }
            }
        });
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

    const horaBodyTemplate = (rowData: Cita) => <span>{rowData.hora}</span>;
    const barberoBodyTemplate = (rowData: Cita) => <span>{rowData.barbero.nombre}</span>;

    const clienteBodyTemplate = (rowData: Cita) => (
        <div>
            <div style={{ fontWeight: 'bold' }}>{rowData.cliente.nombre}</div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>{rowData.cliente.telefono}</div>
        </div>
    );

    const servicioBodyTemplate = (rowData: Cita) => (
        <div>
            <div>{rowData.servicio.descripcion}</div>
            <div style={{ fontSize: '0.9em', color: '#666' }}>${rowData.servicio.costo}</div>
        </div>
    );

    const accionesBodyTemplate = (rowData: Cita) => (
        <div className="flex gap-2 justify-content-center">
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                className="p-button-success"
                onClick={() => handleEditarCita(rowData)}
                tooltip="Editar cita"
            />
            <Button
                icon="pi pi-trash"
                rounded
                outlined
                className="p-button-danger"
                onClick={() => handleEliminarCita(rowData)}
                tooltip="Eliminar cita"
            />
        </div>
    );

    const citasDialogFooter = (
        <Button
            label="Cerrar"
            icon="pi pi-times"
            onClick={() => setShowCitasDialog(false)}
            className="p-button-text"
        />
    );

    const editDialogFooter = (
        <>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                outlined
                onClick={() => setShowEditDialog(false)}
            />
            <Button
                label="Actualizar"
                icon="pi pi-check"
                onClick={handleActualizarCita}
            />
        </>
    );

    return (
        <div style={{ display: 'flex' }}>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Topbar */}
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
                <PanelMenu model={items} style={{ width: '100%' }} />
            </div>

            {/* Main Content */}
            <div style={{
                flexGrow: 1,
                marginLeft: '100px',
                marginTop: '60px',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '3rem',
            }}>
                {/* Calendar */}
                <div style={{ width: '750px', height: '560px' }}>
                    <Calendar
                        value={date}
                        onChange={handleDateSelect}
                        inline
                        showWeek
                        dateTemplate={dateTemplate}
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
                <div style={{ width: '320px' }}>
                    <Card title="Nueva Cita">
                        <div className="p-fluid" style={{ padding: '0.5rem' }}>
                            <div className="field mb-3">
                                <label htmlFor="barbero" className="font-bold">Barbero</label>
                                <Dropdown id="barbero" value={selectedBarbero} onChange={(e) => setSelectedBarbero(e.value)} options={barberos} optionLabel="nombreBarbero" placeholder="Selecciona un barbero" className={classNames({'p-invalid': submitted && !selectedBarbero})} />
                                {submitted && !selectedBarbero && <small className="p-error">El barbero es requerido.</small>}
                            </div>
                            <div className="field mb-3">
                                <label htmlFor="servicio" className="font-bold">Servicio</label>
                                <Dropdown id="servicio" value={selectedServicio} onChange={(e) => setSelectedServicio(e.value)} options={servicios} optionLabel="nombreServicio" placeholder="Selecciona un servicio" className={classNames({'p-invalid': submitted && !selectedServicio})} />
                                {submitted && !selectedServicio && <small className="p-error">El servicio es requerido.</small>}
                            </div>
                            <div className="field mb-3">
                                <label htmlFor="nombreCliente" className="font-bold">Nombre del Cliente</label>
                                <InputText id="nombreCliente" value={cliente.nombre} onChange={(e) => setCliente({...cliente, nombre: e.target.value})} placeholder="Nombre del cliente" className={classNames({'p-invalid': submitted && !cliente.nombre.trim()})} />
                                {submitted && !cliente.nombre.trim() && <small className="p-error">El nombre es requerido.</small>}
                            </div>
                            <div className="field mb-3">
                                <label htmlFor="telefono" className="font-bold">Teléfono del Cliente</label>
                                <InputText id="telefono" type="tel" value={cliente.telefono} onChange={(e) => setCliente({...cliente, telefono: e.target.value})} placeholder="Teléfono del cliente" className={classNames({'p-invalid': submitted && !cliente.telefono.trim()})} />
                                {submitted && !cliente.telefono.trim() && <small className="p-error">El teléfono es requerido.</small>}
                            </div>
                            <div className="field mb-3">
                                <label htmlFor="fecha" className="font-bold">Fecha de la Cita</label>
                                <Calendar id="fecha" value={selectedDate} onChange={(e) => setSelectedDate(e.value)} dateFormat="dd/M/yy" readOnlyInput className={classNames({'p-invalid': submitted && !selectedDate})} />
                                {submitted && !selectedDate && <small className="p-error">La fecha es requerida.</small>}
                            </div>
                            <div className="field mb-3">
                                <label htmlFor="hora" className="font-bold">Hora de la Cita</label>
                                <Calendar id="hora" value={hora} onChange={(e) => setHora(e.value)} timeOnly hourFormat="12" className={classNames({'p-invalid': submitted && !hora})} />
                                {submitted && !hora && <small className="p-error">La hora es requerida.</small>}
                            </div>
                            <div className="text-center mt-2">
                                <Button label="Agendar Cita" icon="pi pi-check" onClick={handleAgendarCita} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Dialog visible={showCitasDialog} style={{ width: '80vw', maxWidth: '1000px' }} header={<div className="flex align-items-center gap-2"><i className="pi pi-calendar" style={{ color: '#10b981' }}></i><span style={{ color: '#333', fontWeight: '600' }}>Citas del {selectedDate?.toLocaleDateString('es-MX')}</span></div>} modal footer={citasDialogFooter} onHide={() => setShowCitasDialog(false)}>
                <DataTable value={citasDelDia} responsiveLayout="scroll" emptyMessage="No hay citas para este día">
                    <Column field="hora" header="Hora" body={horaBodyTemplate} style={{ minWidth: '100px' }} />
                    <Column field="barbero.nombre" header="Barbero" body={barberoBodyTemplate} style={{ minWidth: '150px' }} />
                    <Column field="cliente" header="Cliente" body={clienteBodyTemplate} style={{ minWidth: '180px' }} />
                    <Column field="servicio" header="Servicio" body={servicioBodyTemplate} style={{ minWidth: '180px' }} />
                    <Column header="Acciones" body={accionesBodyTemplate} style={{ minWidth: '8rem', textAlign: 'center' }} />
                </DataTable>
            </Dialog>

            <Dialog visible={showEditDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Editar Cita" modal className="p-fluid" footer={editDialogFooter} onHide={() => setShowEditDialog(false)}>
                <div className="field mb-3">
                    <label htmlFor="edit-barbero" className="font-bold">Barbero</label>
                    <Dropdown id="edit-barbero" value={editData.barbero} onChange={(e) => setEditData({...editData, barbero: e.value})} options={barberos} optionLabel="nombreBarbero" placeholder="Selecciona un barbero" />
                </div>
                <div className="field mb-3">
                    <label htmlFor="edit-servicio" className="font-bold">Servicio</label>
                    <Dropdown id="edit-servicio" value={editData.servicio} onChange={(e) => setEditData({...editData, servicio: e.value})} options={servicios} optionLabel="nombreServicio" placeholder="Selecciona un servicio" />
                </div>
                <div className="field mb-3">
                    <label htmlFor="edit-nombre" className="font-bold">Nombre del Cliente</label>
                    <InputText id="edit-nombre" value={editData.cliente.nombre} onChange={(e) => setEditData({ ...editData, cliente: {...editData.cliente, nombre: e.target.value} })} placeholder="Nombre del cliente" />
                </div>
                <div className="field mb-3">
                    <label htmlFor="edit-telefono" className="font-bold">Teléfono del Cliente</label>
                    <InputText id="edit-telefono" value={editData.cliente.telefono} onChange={(e) => setEditData({ ...editData, cliente: {...editData.cliente, telefono: e.target.value} })} placeholder="Teléfono del cliente" />
                </div>
                <div className="field mb-3">
                    <label htmlFor="edit-fecha" className="font-bold">Fecha de la Cita</label>
                    <Calendar id="edit-fecha" value={editData.fecha} onChange={(e) => setEditData({...editData, fecha: e.value})} dateFormat="dd/M/yy" />
                </div>
                <div className="field mb-3">
                    <label htmlFor="edit-hora" className="font-bold">Hora de la Cita</label>
                    <Calendar id="edit-hora" value={editData.hora} onChange={(e) => setEditData({...editData, hora: e.value})} timeOnly hourFormat="12" />
                </div>
            </Dialog>
        </div>
    );
}