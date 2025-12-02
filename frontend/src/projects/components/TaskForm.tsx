import React, { useState, useEffect } from 'react';
import type { Tarea, TareaFormData, Usuario } from '../../types';
import { crearTarea, actualizarTarea } from '../../services/tareasService';
import { obtenerUsuarios } from '../../services/usuariosService';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import './TaskForm.css';

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    taskToEdit?: Tarea | null;
    inline?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onClose, onSuccess, taskToEdit, inline = false }) => {
    const [formData, setFormData] = useState<TareaFormData>({
        titulo: '',
        descripcion: '',
        fechaLimite: '',
        responsable: '',
        prioridad: 'Media',
        estado: 'Pendiente'
    });
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadUsuarios();
            if (taskToEdit) {
                setFormData({
                    titulo: taskToEdit.titulo,
                    descripcion: taskToEdit.descripcion,
                    fechaLimite: new Date(taskToEdit.fechaLimite).toISOString().split('T')[0],
                    responsable: typeof taskToEdit.responsable === 'object' ? taskToEdit.responsable.uid : taskToEdit.responsable,
                    prioridad: taskToEdit.prioridad || 'Media',
                    estado: taskToEdit.estado
                });
            } else {
                setFormData({
                    titulo: '',
                    descripcion: '',
                    fechaLimite: '',
                    responsable: '',
                    prioridad: 'Media',
                    estado: 'Pendiente'
                });
            }
        }
    }, [isOpen, taskToEdit]);

    const loadUsuarios = async () => {
        const response = await obtenerUsuarios();
        if (response.ok) {
            setUsuarios(response.usuarios);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let response;
            if (taskToEdit) {
                response = await actualizarTarea(taskToEdit.id || taskToEdit._id as string, formData);
            } else {
                response = await crearTarea(formData);
            }

            if (response.ok) {
                onSuccess();
                if (!inline) onClose();
            } else {
                setError(response.msg || 'Error al guardar la tarea');
            }
        } catch (err) {
            setError('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <form onSubmit={handleSubmit} className="task-form">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
                <label className="form-label fw-bold small">Título</label>
                <input
                    name="titulo"
                    className="form-control bg-light border-0"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    placeholder="Título de la tarea"
                    style={{ padding: '10px' }}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold small">Descripción</label>
                <textarea
                    name="descripcion"
                    className="form-control bg-light border-0"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describe los detalles de la tarea..."
                    style={{ padding: '10px', resize: 'none' }}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold small">Asignar a</label>
                <select
                    name="responsable"
                    className="form-select bg-light border-0"
                    value={formData.responsable}
                    onChange={handleChange}
                    required
                    style={{ padding: '10px' }}
                >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map(u => (
                        <option key={u.uid} value={u.uid}>{u.nombre}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold small">Prioridad</label>
                <select
                    name="prioridad"
                    className="form-select bg-light border-0"
                    value={formData.prioridad}
                    onChange={handleChange}
                    style={{ padding: '10px' }}
                >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="form-label fw-bold small">Fecha de vencimiento</label>
                <input
                    type="date"
                    name="fechaLimite"
                    className="form-control bg-light border-0"
                    value={formData.fechaLimite}
                    onChange={handleChange}
                    required
                    style={{ padding: '10px' }}
                />
            </div>



            <div className="d-flex justify-content-end gap-2">
                <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="px-4">
                    Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={loading} className="px-4" style={{ backgroundColor: '#e76f51', borderColor: '#e76f51' }}>
                    {taskToEdit ? 'Actualizar' : 'Crear Tarea'}
                </Button>
            </div>
        </form>
    );

    if (inline) {
        return formContent;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}
            size="md"
        >
            {formContent}
        </Modal>
    );
};

export default TaskForm;
