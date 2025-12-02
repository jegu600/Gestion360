import React, { useEffect, useState } from 'react';
import type { Tarea, EstadoTarea } from '../../types';
import { obtenerTareas, cambiarEstadoTarea } from '../../services/tareasService';
import TaskCard from './TaskCard';
import './TaskBoard.css';

const COLUMNS: { id: EstadoTarea; title: string }[] = [
    { id: 'Pendiente', title: 'Pendiente' },
    { id: 'En_progreso', title: 'En Progreso' },
    { id: 'Completada', title: 'Completada' },
];

const TaskBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Tarea[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTasks = async () => {
        setLoading(true);
        const response = await obtenerTareas();
        if (response.ok && response.tareas) {
            setTasks(response.tareas);
            setError(null);
        } else {
            setError(response.msg || 'Error al cargar tareas');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleTaskUpdate = () => {
        fetchTasks();
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, status: EstadoTarea) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            // Optimistic update
            const updatedTasks = tasks.map(t =>
                (t.id === taskId || t._id === taskId) ? { ...t, estado: status } : t
            );
            setTasks(updatedTasks);

            const response = await cambiarEstadoTarea(taskId, status);
            if (!response.ok) {
                // Revert if failed
                fetchTasks();
            }
        }
    };

    if (loading) return <div className="board-loading">Cargando tareas...</div>;
    if (error) return <div className="board-error">{error}</div>;

    return (
        <div className="task-board">
            {COLUMNS.map(col => (
                <div
                    key={col.id}
                    className="board-column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    <div className="column-header">
                        <h3>{col.title}</h3>
                        <span className="task-count">
                            {tasks.filter(t => t.estado === col.id).length}
                        </span>
                    </div>
                    <div className="column-content">
                        {tasks
                            .filter(t => t.estado === col.id)
                            .map(task => (
                                <div
                                    key={task.id || task._id as string}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id || task._id as string)}
                                >
                                    <TaskCard tarea={task} onUpdate={handleTaskUpdate} />
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskBoard;
