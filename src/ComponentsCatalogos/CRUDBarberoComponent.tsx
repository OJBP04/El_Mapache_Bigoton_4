import React, {useState, useEffect, useRef} from 'react';
import {InputText} from 'primereact/inputtext';
import {IconField} from 'primereact/iconfield';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {Toolbar} from 'primereact/toolbar';
import {Dialog} from 'primereact/dialog';
import {InputIcon} from "primereact/inputicon";
import {classNames} from "primereact/utils";
import BarberoService from "../Services/BarberoService.tsx";
import { Card } from 'primereact/card';
import { PanelMenu } from 'primereact/panelmenu';
import type { MenuItem } from 'primereact/menuitem';
import { Avatar } from 'primereact/avatar';

interface Barbero {
    idBarbero: number;
    nombre: string;
}

export default function CRUDBarberoComponent() {
    const emptyBarbero: Barbero = {
        idBarbero: 0,
        nombre: ''
    };

    const [barberos, setBarberos] = useState<Barbero[]>([]);
    const [barbero, setBarbero] = useState<Barbero>(emptyBarbero);
    const [barberoDialog, setBarberoDialog] = useState<boolean>(false);
    const [deleteBarberoDialog, setDeleteBarberoDialog] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);

    // Estados para modos de eliminación y edición
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

    const sidebarItems: MenuItem[] = [
        { label: 'Agenda', icon: 'pi pi-calendar' },
        { label: 'Catálogos', icon: 'pi pi-pen-to-square', url: '/catalogos' },
    ];

    useEffect(() => {
        BarberoService.findAll().then((response) => setBarberos(response.data));
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

    // Función para activar/desactivar el modo de eliminación
    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        if (!deleteMode && editMode) {
            setEditMode(false);
        }
    };

    // Función para activar/desactivar el modo de edición
    const toggleEditMode = () => {
        setEditMode(!editMode);
        if (!editMode && deleteMode) {
            setDeleteMode(false);
        }
    };

    // Función simplificada para editar un barbero directamente
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
                // Actualizar barbero existente
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
                // Crear nuevo barbero
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

    const leftToolbarTemplate = () => {
        return null; // Ya no se necesita, todo está en el header
    };

    // Filtrar barberos
    const filteredBarberos = barberos.filter((barbero) =>
        barbero.nombre.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const barberoDialogFooter = (
        <React.Fragment>
            <Button
                label="Cancelar"
                icon="pi pi-times"
                outlined
                onClick={hideDialog}
            />
            <Button
                label="Guardar"
                icon="pi pi-check"
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
                onClick={hideDeleteBarberoDialog}
            />
            <Button
                label="Sí"
                icon="pi pi-check"
                severity="danger"
                onClick={deleteBarbero}
            />
        </React.Fragment>
    );

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

            {/* Iconos de acciones */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Buscar */}
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText
                        type="search"
                        placeholder="Buscar barberos..."
                        className="buscar-input"
                        onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            setGlobalFilter(target.value);
                        }}
                    />
                </IconField>

                {/* Botón Eliminar/Salir */}
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
                        border: '2px solid #6b7280'
                    }}>
                        <i className="pi pi-times" style={{
                            color: '#6b7280',
                            fontSize: '1.2rem'
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
                        border: '2px solid #f44336'
                    }}>
                        <i className="pi pi-trash" style={{
                            color: '#f44336',
                            fontSize: '1.2rem'
                        }} onClick={toggleDeleteMode}></i>
                    </div>
                )}

                {/* Botón Editar/Salir */}
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
                        border: '2px solid #6b7280'
                    }}>
                        <i className="pi pi-times" style={{
                            color: '#6b7280',
                            fontSize: '1.2rem'
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
                        border: '2px solid #ff9800'
                    }}>
                        <i className="pi pi-pencil" style={{
                            color: '#ff9800',
                            fontSize: '1.2rem'
                        }} onClick={toggleEditMode}></i>
                    </div>
                )}

                {/* Botón Nuevo - Solo visible cuando no está en modo editar o eliminar */}
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
                        border: '2px solid #4CAF50'
                    }}>
                        <i className="pi pi-plus boton-plus-icon" style={{
                            color: '#4CAF50',
                            fontSize: '1.2rem'
                        }} onClick={openNew}></i>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex' }}>
            <Toast ref={toast} />

            {/* Barra superior */}
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

            {/* Sidebar */}
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

            {/* Contenido principal */}
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
                    {/* Encabezado */}
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

                    {/* Tarjetas de barberos */}
                    <div className="grid p-1 gap-10">
                        {filteredBarberos.map((barbero) => {
                            // Obtenemos la primera letra del nombre para el Avatar
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
                                                // Se remueve el backgroundColor para que no sea claro
                                            } : deleteMode ? {
                                                border: '2px dashed #ef4444',
                                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                                                // Se remueve el backgroundColor para que no sea claro
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
                                                // Se elimina el backgroundColor para mantener el color de fondo original
                                                borderRadius: '8px',
                                                border: '1px solid rgba(245, 158, 11, 0.3)'
                                            }}>
                                                <i className="pi pi-pencil" style={{color: '#f59e0b', fontSize: '1.2rem'}}></i>
                                                <span style={{color: '#d97706', fontWeight: '600'}}>Click para editar</span>
                                            </div>
                                        )}

                                        {deleteMode && (
                                            <div className="flex justify-content-center align-items-center gap-2" style={{
                                                padding: '0.75rem',
                                                // Se elimina el backgroundColor para mantener el color de fondo original
                                                borderRadius: '8px',
                                                border: '1px solid rgba(239, 68, 68, 0.3)'
                                            }}>
                                                <i className="pi pi-trash" style={{color: '#ef4444', fontSize: '1.2rem'}}></i>
                                                <span style={{color: '#dc2626', fontWeight: '600'}}>Click para eliminar</span>
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {/* Mensaje cuando no hay barberos */}
                    {filteredBarberos.length === 0 && (
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
                                    <i className="pi pi-search" style={{fontSize: '3rem', marginBottom: '1rem', display: 'block'}} />
                                    <p>No se encontraron barberos que coincidan con "{globalFilter}"</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Dialog para crear/editar barbero */}
                <Dialog
                    visible={barberoDialog}
                    style={{ width: '32rem' }}
                    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                    header={
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-user" style={{color: '#ff9800'}}></i>
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

                {/* Dialog para confirmar eliminación */}
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
            </div>
        </div>
    );
}