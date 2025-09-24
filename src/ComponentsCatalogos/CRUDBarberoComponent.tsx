import React, {useState, useEffect, useRef} from 'react';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {Toolbar} from 'primereact/toolbar';
import {Dialog} from 'primereact/dialog';
import {classNames} from "primereact/utils";
import BarberoService from "../Services/BarberoService.tsx";
import { Card } from 'primereact/card';
import { PanelMenu } from 'primereact/panelmenu';
import type { MenuItem } from 'primereact/menuitem';
import { Avatar } from 'primereact/avatar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';

interface Barbero {
    idBarbero: number;
    nombre: string;
}

interface Servicio {
    idServicio: number;
    descripcion: string;
    costo: number;
}

// Si no tienes ServicioService, usa el mock temporalmente
// import ServicioService from "../Services/ServicioService.tsx";

// Mock temporal hasta que tengas el ServicioService real
const ServicioService = {
    findAll: () => new Promise<{ data: Servicio[] }>(resolve => {
        setTimeout(() => {
            resolve({ data: [] }); // Array vacío para que se llene dinámicamente
        }, 500);
    }),
    create: (servicio: Servicio) => new Promise<{ data: Servicio }>(resolve => {
        setTimeout(() => {
            const newId = Math.floor(Math.random() * 1000) + 10;
            resolve({ data: { ...servicio, idServicio: newId } });
        }, 500);
    }),
    update: (id: number, servicio: Servicio) => new Promise<{ data: Servicio }>(resolve => {
        setTimeout(() => {
            resolve({ data: { ...servicio, idServicio: id } });
        }, 500);
    }),
    delete: (id: number) => new Promise<void>(resolve => {
        setTimeout(() => {
            console.log(`Servicio con ID ${id} eliminado.`);
            resolve();
        }, 500);
    }),
};

// Estilos unificados para botones
const buttonStyles = {
    add: {
        default: {
            backgroundColor: 'transparent',
            borderColor: '#10b981',
            color: '#10b981',
            transition: 'all 0.3s ease',
        },
        hover: {
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            color: 'white',
            transform: 'scale(1.05)',
        }
    },
    edit: {
        default: {
            backgroundColor: 'transparent',
            borderColor: '#f59e0b',
            color: '#f59e0b',
            transition: 'all 0.3s ease',
        },
        hover: {
            backgroundColor: '#f59e0b',
            borderColor: '#f59e0b',
            color: 'white',
            transform: 'scale(1.05)',
        }
    },
    delete: {
        default: {
            backgroundColor: 'transparent',
            borderColor: '#ef4444',
            color: '#ef4444',
            transition: 'all 0.3s ease',
        },
        hover: {
            backgroundColor: '#ef4444',
            borderColor: '#ef4444',
            color: 'white',
            transform: 'scale(1.05)',
        }
    },
    cancel: {
        default: {
            backgroundColor: 'transparent',
            borderColor: '#6b7280',
            color: '#6b7280',
            transition: 'all 0.3s ease',
        },
        hover: {
            backgroundColor: '#6b7280',
            borderColor: '#6b7280',
            color: 'white',
            transform: 'scale(1.05)',
        }
    }
};

// Función para manejar hover de botones
const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, buttonType: keyof typeof buttonStyles, isHovering: boolean) => {
    const style = e.currentTarget.style;
    const styleConfig = buttonStyles[buttonType];

    if (isHovering) {
        style.backgroundColor = styleConfig.hover.backgroundColor;
        style.borderColor = styleConfig.hover.borderColor || styleConfig.default.borderColor;
        style.color = styleConfig.hover.color;
        style.transform = styleConfig.hover.transform;
    } else {
        style.backgroundColor = styleConfig.default.backgroundColor;
        style.borderColor = styleConfig.default.borderColor;
        style.color = styleConfig.default.color;
        style.transform = 'scale(1)';
    }
};

export default function CRUDBarberoComponent() {
    const emptyBarbero: Barbero = {
        idBarbero: 0,
        nombre: ''
    };

    const emptyServicio: Servicio = {
        idServicio: 0,
        descripcion: '',
        costo: 0
    };

    const [barberos, setBarberos] = useState<Barbero[]>([]);
    const [barbero, setBarbero] = useState<Barbero>(emptyBarbero);
    const [barberoDialog, setBarberoDialog] = useState<boolean>(false);
    const [deleteBarberoDialog, setDeleteBarberoDialog] = useState<boolean>(false);

    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [servicio, setServicio] = useState<Servicio>(emptyServicio);
    const [servicioDialog, setServicioDialog] = useState<boolean>(false);
    const [deleteServicioDialog, setDeleteServicioDialog] = useState<boolean>(false);

    const [submitted, setSubmitted] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

    const sidebarItems: MenuItem[] = [
        { label: 'Agenda', icon: 'pi pi-calendar' },
        { label: 'Catálogos', icon: 'pi pi-pen-to-square', url: '/catalogos' },
    ];

    useEffect(() => {
        BarberoService.findAll().then((response) => setBarberos(response.data));
        ServicioService.findAll().then((response) => setServicios(response.data));
    }, []);

    const openNew = () => {
        setBarbero(emptyBarbero);
        setSubmitted(false);
        setBarberoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setBarberoDialog(false);
    };

    const hideDeleteBarberoDialog = () => {
        setDeleteBarberoDialog(false);
    };

    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        if (!deleteMode && editMode) {
            setEditMode(false);
        }
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
        if (!editMode && deleteMode) {
            setDeleteMode(false);
        }
    };

    const selectBarberoToEdit = async (barbero: Barbero) => {
        if (!editMode) return;
        await editBarbero(barbero);
    };

    const saveBarbero = async () => {
        setSubmitted(true);
        if (barbero.nombre.trim()) {
            const _barberos = [...barberos];
            const _barbero = {...barbero};

            if (barbero.idBarbero) {
                BarberoService.update(barbero.idBarbero, _barbero);
                const index = findIndexById(barbero.idBarbero);
                _barberos[index] = _barbero;

                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Barbero Actualizado',
                    life: 3000
                });
            } else {
                _barbero.idBarbero = await getIdBarbero(_barbero);
                _barberos.push(_barbero);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Barbero Creado',
                    life: 3000
                });
            }

            setBarberos(_barberos);
            setBarberoDialog(false);
            setBarbero(emptyBarbero);
        }
    };

    const getIdBarbero = async (_barbero: Barbero) => {
        let idBarbero = 0;
        await BarberoService.create(_barbero).then((response)=>{
            idBarbero = response.data.idBarbero;
        }).catch(error=>{
            console.log(error);
        });
        return idBarbero;
    };

    const editBarbero = async (barbero: Barbero) => {
        setBarbero({...barbero});
        setBarberoDialog(true);
    };

    const confirmDeleteBarbero = (barbero: Barbero) => {
        setBarbero(barbero);
        setDeleteBarberoDialog(true);
    };

    const deleteBarbero = () => {
        const _barberos = barberos.filter((val)=> val.idBarbero !== barbero.idBarbero);
        BarberoService.delete(barbero.idBarbero);
        setBarberos(_barberos);
        setDeleteBarberoDialog(false);
        setBarbero(emptyBarbero);
        toast.current?.show({
            severity: 'success',
            summary: 'Resultado',
            detail: 'Barbero Eliminado',
            life: 3000
        });
    };

    const findIndexById = (idBarbero: number) => {
        let index = -1;
        for (let i = 0; i < barberos.length; i++) {
            if(barberos[i].idBarbero === idBarbero) {
                index = i;
                break;
            }
        }
        return index;
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value)||"";
        const _barbero = {...barbero};
        _barbero.nombre = val;
        setBarbero(_barbero);
    };

    const openNewServicio = () => {
        setServicio(emptyServicio);
        setSubmitted(false);
        setServicioDialog(true);
    };

    const hideServicioDialog = () => {
        setSubmitted(false);
        setServicioDialog(false);
    };

    const hideDeleteServicioDialog = () => {
        setDeleteServicioDialog(false);
    };

    const saveServicio = async () => {
        setSubmitted(true);
        if (servicio.descripcion.trim() && servicio.costo > 0) {
            const _servicios = [...servicios];
            const _servicio = {...servicio};

            if (_servicio.idServicio) {
                ServicioService.update(_servicio.idServicio, _servicio);
                const index = findIndexServicioById(_servicio.idServicio);
                _servicios[index] = _servicio;
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Servicio Actualizado',
                    life: 3000
                });
            } else {
                _servicio.idServicio = await getIdServicio(_servicio);
                _servicios.push(_servicio);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Servicio Creado',
                    life: 3000
                });
            }

            setServicios(_servicios);
            setServicioDialog(false);
            setServicio(emptyServicio);
        }
    };

    const getIdServicio = async (_servicio: Servicio) => {
        let idServicio = 0;
        await ServicioService.create(_servicio).then((response)=>{
            idServicio = response.data.idServicio;
        }).catch(error=>{
            console.log(error);
        });
        return idServicio;
    };

    const editServicio = (servicio: Servicio) => {
        setServicio({...servicio});
        setServicioDialog(true);
    };

    const confirmDeleteServicio = (servicio: Servicio) => {
        setServicio(servicio);
        setDeleteServicioDialog(true);
    };

    const deleteServicio = () => {
        const _servicios = servicios.filter((val) => val.idServicio !== servicio.idServicio);
        ServicioService.delete(servicio.idServicio);
        setServicios(_servicios);
        setDeleteServicioDialog(false);
        setServicio(emptyServicio);
        toast.current?.show({severity: 'success', summary: 'Resultado', detail: 'Servicio Eliminado', life: 3000});
    };

    const findIndexServicioById = (idServicio: number) => {
        let index = -1;
        for (let i = 0; i < servicios.length; i++) {
            if(servicios[i].idServicio === idServicio) {
                index = i;
                break;
            }
        }
        return index;
    };

    const onServicioInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (e.target && e.target.value)||"";
        const _servicio = {...servicio};
        _servicio.descripcion = val;
        setServicio(_servicio);
    };

    const leftToolbarTemplate = () => {
        return null;
    };

    const barberoDialogFooter = (
        <React.Fragment>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                outlined
                style={buttonStyles.cancel.default}
                onMouseEnter={(e) => handleButtonHover(e, 'cancel', true)}
                onMouseLeave={(e) => handleButtonHover(e, 'cancel', false)}
                onClick={hideDialog}
            />
            <Button
                label="Guardar"
                icon="pi pi-check"
                outlined
                style={buttonStyles.add.default}
                onMouseEnter={(e) => handleButtonHover(e, 'add', true)}
                onMouseLeave={(e) => handleButtonHover(e, 'add', false)}
                onClick={saveBarbero}
            />
        </React.Fragment>
    );

    const deleteBarberoDialogFooter = (
        <React.Fragment>
            <Button
                label="No"
                icon="pi pi-times"
                outlined
                style={buttonStyles.cancel.default}
                onMouseEnter={(e) => handleButtonHover(e, 'cancel', true)}
                onMouseLeave={(e) => handleButtonHover(e, 'cancel', false)}
                onClick={hideDeleteBarberoDialog}
            />
            <Button
                label="Sí"
                icon="pi pi-check"
                outlined
                style={buttonStyles.delete.default}
                onMouseEnter={(e) => handleButtonHover(e, 'delete', true)}
                onMouseLeave={(e) => handleButtonHover(e, 'delete', false)}
                onClick={deleteBarbero}
            />
        </React.Fragment>
    );

    const servicioDialogFooter = (
        <React.Fragment>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                outlined
                style={buttonStyles.cancel.default}
                onMouseEnter={(e) => handleButtonHover(e, 'cancel', true)}
                onMouseLeave={(e) => handleButtonHover(e, 'cancel', false)}
                onClick={hideServicioDialog}
            />
            <Button
                label="Guardar"
                icon="pi pi-check"
                outlined
                style={buttonStyles.add.default}
                onMouseEnter={(e) => handleButtonHover(e, 'add', true)}
                onMouseLeave={(e) => handleButtonHover(e, 'add', false)}
                onClick={saveServicio}
            />
        </React.Fragment>
    );

    const deleteServicioDialogFooter = (
        <React.Fragment>
            <Button
                label="No"
                icon="pi pi-times"
                outlined
                style={buttonStyles.cancel.default}
                onMouseEnter={(e) => handleButtonHover(e, 'cancel', true)}
                onMouseLeave={(e) => handleButtonHover(e, 'cancel', false)}
                onClick={hideDeleteServicioDialog}
            />
            <Button
                label="Sí"
                icon="pi pi-check"
                outlined
                style={buttonStyles.delete.default}
                onMouseEnter={(e) => handleButtonHover(e, 'delete', true)}
                onMouseLeave={(e) => handleButtonHover(e, 'delete', false)}
                onClick={deleteServicio}
            />
        </React.Fragment>
    );

    const actionBodyTemplate = (rowData: Servicio) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    style={buttonStyles.edit.default}
                    onMouseEnter={(e) => handleButtonHover(e, 'edit', true)}
                    onMouseLeave={(e) => handleButtonHover(e, 'edit', false)}
                    onClick={() => editServicio(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    style={buttonStyles.delete.default}
                    onMouseEnter={(e) => handleButtonHover(e, 'delete', true)}
                    onMouseLeave={(e) => handleButtonHover(e, 'delete', false)}
                    onClick={() => confirmDeleteServicio(rowData)}
                />
            </div>
        );
    };

    const header = (
        <div className="header-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 0',
            borderBottom: '1px solid #ddd',
            marginBottom: '2rem'
        }}>
            <h2 className="titulo-principal" style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 'bold'
            }}>
                Barberos
                {deleteMode && <span className="modo-eliminar" style={{fontSize: '1.2rem'}}> (Eliminar)</span>}
                {editMode && <span className="modo-editar" style={{fontSize: '1.2rem'}}> (Editar)</span>}
            </h2>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {deleteMode ? (
                    <div style={{
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: `2px solid ${buttonStyles.cancel.default.borderColor}`,
                        backgroundColor: buttonStyles.cancel.default.backgroundColor,
                        transition: 'all 0.3s ease'
                    }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.cancel.hover.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.cancel.hover.color;
                             e.currentTarget.style.transform = buttonStyles.cancel.hover.transform;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.cancel.hover.color;
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.cancel.default.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.cancel.default.color;
                             e.currentTarget.style.transform = 'scale(1)';
                             e.currentTarget.style.border = `2px solid ${buttonStyles.cancel.default.borderColor}`;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.cancel.default.color;
                         }}>
                        <i className="pi pi-times" style={{
                            color: buttonStyles.cancel.default.color,
                            fontSize: '1.2rem',
                            transition: 'color 0.3s ease'
                        }} onClick={toggleDeleteMode}></i>
                    </div>
                ) : !editMode && (
                    <div style={{
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: `2px solid ${buttonStyles.delete.default.borderColor}`,
                        backgroundColor: buttonStyles.delete.default.backgroundColor,
                        transition: 'all 0.3s ease'
                    }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.delete.hover.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.delete.hover.color;
                             e.currentTarget.style.transform = buttonStyles.delete.hover.transform;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.delete.hover.color;
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.delete.default.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.delete.default.color;
                             e.currentTarget.style.transform = 'scale(1)';
                             e.currentTarget.style.border = `2px solid ${buttonStyles.delete.default.borderColor}`;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.delete.default.color;
                         }}>
                        <i className="pi pi-trash" style={{
                            color: buttonStyles.delete.default.color,
                            fontSize: '1.2rem',
                            transition: 'color 0.3s ease'
                        }} onClick={toggleDeleteMode}></i>
                    </div>
                )}

                {editMode ? (
                    <div style={{
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: `2px solid ${buttonStyles.cancel.default.borderColor}`,
                        backgroundColor: buttonStyles.cancel.default.backgroundColor,
                        transition: 'all 0.3s ease'
                    }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.cancel.hover.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.cancel.hover.color;
                             e.currentTarget.style.transform = buttonStyles.cancel.hover.transform;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.cancel.hover.color;
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.cancel.default.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.cancel.default.color;
                             e.currentTarget.style.transform = 'scale(1)';
                             e.currentTarget.style.border = `2px solid ${buttonStyles.cancel.default.borderColor}`;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.cancel.default.color;
                         }}>
                        <i className="pi pi-times" style={{
                            color: buttonStyles.cancel.default.color,
                            fontSize: '1.2rem',
                            transition: 'color 0.3s ease'
                        }} onClick={toggleEditMode}></i>
                    </div>
                ) : !deleteMode && (
                    <div style={{
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: `2px solid ${buttonStyles.edit.default.borderColor}`,
                        backgroundColor: buttonStyles.edit.default.backgroundColor,
                        transition: 'all 0.3s ease'
                    }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.edit.hover.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.edit.hover.color;
                             e.currentTarget.style.transform = buttonStyles.edit.hover.transform;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.edit.hover.color;
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.edit.default.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.edit.default.color;
                             e.currentTarget.style.transform = 'scale(1)';
                             e.currentTarget.style.border = `2px solid ${buttonStyles.edit.default.borderColor}`;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.edit.default.color;
                         }}>
                        <i className="pi pi-pencil" style={{
                            color: buttonStyles.edit.default.color,
                            fontSize: '1.2rem',
                            transition: 'color 0.3s ease'
                        }} onClick={toggleEditMode}></i>
                    </div>
                )}

                {!editMode && !deleteMode && (
                    <div className="boton-plus-container" style={{
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: `2px solid ${buttonStyles.add.default.borderColor}`,
                        backgroundColor: buttonStyles.add.default.backgroundColor,
                        transition: 'all 0.3s ease'
                    }}
                         onMouseEnter={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.add.hover.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.add.hover.color;
                             e.currentTarget.style.transform = buttonStyles.add.hover.transform;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.add.hover.color;
                         }}
                         onMouseLeave={(e) => {
                             e.currentTarget.style.backgroundColor = buttonStyles.add.default.backgroundColor;
                             e.currentTarget.style.color = buttonStyles.add.default.color;
                             e.currentTarget.style.transform = 'scale(1)';
                             e.currentTarget.style.border = `2px solid ${buttonStyles.add.default.borderColor}`;
                             const icon = e.currentTarget.querySelector('i');
                             if (icon) icon.style.color = buttonStyles.add.default.color;
                         }}>
                        <i className="pi pi-plus boton-plus-icon" style={{
                            color: buttonStyles.add.default.color,
                            fontSize: '1.2rem',
                            transition: 'color 0.3s ease'
                        }} onClick={openNew}></i>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex' }}>
            <Toast ref={toast} />

            <div className="topbar" style={{
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

            <div className="sidebar" style={{
                width: '250px',
                borderRight: '1px solid #ccc',
                height: '100vh',
                overflowY: 'auto',
                position: 'fixed',
                top: '60px',
                left: 0,
                padding: '1rem'
            }}>
                <PanelMenu model={sidebarItems} style={{ width: '100%' }} />
            </div>

            <div className="main-content" style={{
                flexGrow: 1,
                marginLeft: '250px',
                marginTop: '60px',
                padding: '2rem'
            }}>
                <div className="card" style={{
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}>
                    {header}

                    <Toolbar
                        className="mb-4 toolbar-custom"
                        left={leftToolbarTemplate}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '0'
                        }}
                    />

                    <div className="grid p-1 gap-10">
                        {barberos.map((barbero) => {
                            const firstLetter = barbero.nombre.charAt(0).toUpperCase();

                            return (
                                <div key={barbero.idBarbero} className="col-12 md:col-4 lg:col-3">
                                    <Card
                                        title={
                                            <div className="flex flex-column align-items-center gap-2 justify-content-center mb-3">
                                                <Avatar
                                                    label={firstLetter}
                                                    size="xlarge"
                                                    shape="circle"
                                                    style={{
                                                        backgroundColor: 'var(--primary-color)',
                                                        color: 'white',
                                                        fontSize: '1.5rem',
                                                        fontWeight: '700'
                                                    }}
                                                />
                                                <span className="mt-2 font-bold" style={{
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {barbero.nombre}
                                                </span>
                                            </div>
                                        }
                                        className={(deleteMode || editMode) ? 'cursor-pointer text-center' : 'cursor-pointer text-center'}
                                        style={{
                                            ...(editMode ? {
                                                border: '2px dashed #f59e0b',
                                                boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
                                            } : deleteMode ? {
                                                border: '2px dashed #ef4444',
                                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                                            } : {}),
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease',
                                            minHeight: '200px'
                                        }}
                                        onClick={() => {
                                            if (editMode) {
                                                selectBarberoToEdit(barbero);
                                            } else if (deleteMode) {
                                                confirmDeleteBarbero(barbero);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!editMode && !deleteMode) {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!editMode && !deleteMode) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                            }
                                        }}
                                    >
                                        {editMode && (
                                            <div className="flex justify-content-center align-items-center gap-2" style={{
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(245, 158, 11, 0.3)'
                                            }}>
                                                <i className="pi pi-pencil" style={{color: '#f59e0b', fontSize: '1.2rem'}}></i>
                                                <span style={{color: '#f59e0b', fontWeight: '600'}}>Click para editar</span>
                                            </div>
                                        )}

                                        {deleteMode && (
                                            <div className="flex justify-content-center align-items-center gap-2" style={{
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(239, 68, 68, 0.3)'
                                            }}>
                                                <i className="pi pi-trash" style={{color: '#ef4444', fontSize: '1.2rem'}}></i>
                                                <span style={{color: '#ef4444', fontWeight: '600'}}>Click para eliminar</span>
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {barberos.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            color: '#666'
                        }}>
                            {barberos.length === 0 ? (
                                <>
                                    <i className="pi pi-users" style={{fontSize: '3rem', marginBottom: '1rem', display: 'block'}} />
                                    <p>No hay barberos registrados</p>
                                </>
                            ) : (
                                <>

                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="card mt-5" style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                }}>
                    <div className="header-container" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 0',
                        borderBottom: '1px solid #ddd',
                        marginBottom: '1rem'
                    }}>
                        <h2 className="titulo-principal" style={{
                            margin: 0,
                            fontSize: '2rem',
                            fontWeight: 'bold'
                        }}>
                            Servicios
                        </h2>
                        <Button
                            icon="pi pi-plus"
                            rounded
                            outlined
                            style={buttonStyles.add.default}
                            onMouseEnter={(e) => handleButtonHover(e, 'add', true)}
                            onMouseLeave={(e) => handleButtonHover(e, 'add', false)}
                            onClick={openNewServicio}
                        />
                    </div>
                    <DataTable value={servicios} tableStyle={{ minWidth: '50rem' }}>
                        <Column field="descripcion" header="Descripción del Servicio"></Column>
                        <Column field="costo" header="Costo" body={(rowData) => `${rowData.costo}`}></Column>
                        <Column
                            header="Acciones"
                            body={actionBodyTemplate}
                            style={{ minWidth: '8rem', textAlign: 'center' }}
                        />
                    </DataTable>
                </div>

                <Dialog
                    visible={barberoDialog}
                    style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header={
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-user" style={{color: '#f59e0b'}}></i>
                            <span style={{color: '#333', fontWeight: '600'}}>Detalles del Barbero</span>
                        </div>
                    }
                    modal
                    className="p-fluid"
                    footer={barberoDialogFooter}
                    onHide={hideDialog}
                >
                    <div className="field">
                        <label htmlFor="nombre" className="font-bold" style={{
                            color: '#333',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            Nombre
                        </label>
                        <InputText
                            id="nombre"
                            value={barbero.nombre}
                            onChange={(e) => onInputChange(e)}
                            required
                            autoFocus
                            className={classNames({'p-invalid':submitted && !barbero.nombre})}
                            style={{
                                borderRadius: '8px',
                                padding: '0.75rem',
                                transition: 'all 0.3s ease'
                            }}
                        />
                        {submitted && !barbero.nombre &&
                            <small className="p-error">El nombre es requerido.</small>
                        }
                    </div>
                </Dialog>

                <Dialog
                    visible={deleteBarberoDialog}
                    style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header={
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-exclamation-triangle" style={{color: '#ef4444'}}></i>
                            <span style={{color: '#333', fontWeight: '600'}}>Confirmar Eliminación</span>
                        </div>
                    }
                    modal
                    footer={deleteBarberoDialogFooter}
                    onHide={hideDeleteBarberoDialog}
                >
                    <div className="confirmation-content flex align-items-center gap-3 p-3" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.1)'
                    }}>
                        <i className="pi pi-exclamation-triangle text-3xl" style={{ color: '#ef4444' }} />
                        {barbero && (
                            <span style={{
                                color: '#333',
                                fontSize: '1.1rem',
                                lineHeight: '1.5'
                            }}>
                                ¿Estás seguro de eliminar al barbero <br/>
                                <strong style={{ color: '#ef4444', fontSize: '1.2rem' }}>"{barbero.nombre}"</strong>?
                            </span>
                        )}
                    </div>
                </Dialog>

                <Dialog
                    visible={servicioDialog}
                    style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header={
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-cog" style={{color: '#059669'}}></i>
                            <span style={{color: '#333', fontWeight: '600'}}>Detalles del Servicio</span>
                        </div>
                    }
                    modal
                    className="p-fluid"
                    footer={servicioDialogFooter}
                    onHide={hideServicioDialog}
                >
                    <div className="field">
                        <label htmlFor="descripcion" className="font-bold" style={{
                            color: '#333',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            Descripción
                        </label>
                        <InputText
                            id="descripcion"
                            value={servicio.descripcion}
                            onChange={onServicioInputChange}
                            required
                            className={classNames({'p-invalid': submitted && !servicio.descripcion})}
                            style={{
                                borderRadius: '8px',
                                padding: '0.75rem',
                                transition: 'all 0.3s ease'
                            }}
                        />
                        {submitted && !servicio.descripcion && <small className="p-error">La descripción es requerida.</small>}
                    </div>

                    <div className="field">
                        <label htmlFor="costo" className="font-bold" style={{
                            color: '#333',
                            marginBottom: '0.5rem',
                            display: 'block'
                        }}>
                            Costo
                        </label>
                        <InputNumber
                            id="costo"
                            value={servicio.costo}
                            onValueChange={(e) => setServicio({...servicio, costo: e.value || 0})}
                            mode="currency"
                            currency="MXN"
                            locale="es-MX"
                            required
                            className={classNames({'p-invalid': submitted && !servicio.costo})}
                            style={{
                                borderRadius: '8px'
                            }}
                        />
                        {submitted && !servicio.costo && <small className="p-error">El costo es requerido.</small>}
                    </div>
                </Dialog>

                <Dialog
                    visible={deleteServicioDialog}
                    style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header={
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-exclamation-triangle" style={{color: '#ef4444'}}></i>
                            <span style={{color: '#333', fontWeight: '600'}}>Confirmar Eliminación</span>
                        </div>
                    }
                    modal
                    footer={deleteServicioDialogFooter}
                    onHide={hideDeleteServicioDialog}
                >
                    <div className="confirmation-content flex align-items-center gap-3 p-3" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.1)'
                    }}>
                        <i className="pi pi-exclamation-triangle text-3xl" style={{ color: '#ef4444' }} />
                        {servicio && (
                            <span style={{
                                color: '#333',
                                fontSize: '1.1rem',
                                lineHeight: '1.5'
                            }}>
                                ¿Estás seguro de eliminar el servicio: <br/>
                                <strong style={{color: '#ef4444', fontSize: '1.2rem'}}>"{servicio.descripcion}"</strong>?
                            </span>
                        )}
                    </div>
                </Dialog>
            </div>
        </div>
    );
}