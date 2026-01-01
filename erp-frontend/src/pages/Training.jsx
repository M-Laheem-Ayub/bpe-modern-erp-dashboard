import React, { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, Plus, Search, Download, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Training = () => {
    const [trainings, setTrainings] = useState([]);
    const [formData, setFormData] = useState({
        employeeName: '',
        trainingTopic: '',
        completionDate: '',
        status: 'Scheduled',
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // Edit State
    const [editingId, setEditingId] = useState(null);

    // Bulk Delete State
    const [selectedIds, setSelectedIds] = useState([]);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: null, // 'single' or 'bulk'
        id: null,
        count: 0
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchTrainings = async () => {
        try {
            const response = await api.get('/training');
            setTrainings(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching training schedule:', error);
            setLoading(false);
        }
    };

    const filteredTrainings = trainings.filter(t =>
        (statusFilter === 'All' || t.status === statusFilter) &&
        (t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.trainingTopic.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTrainings.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);

    useEffect(() => {
        fetchTrainings();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing training
                await api.put(`/training/${editingId}`, formData);
                setEditingId(null);
            } else {
                // Create new training
                await api.post('/training', formData);
            }
            setFormData({ employeeName: '', trainingTopic: '', completionDate: '', status: 'Scheduled' });
            fetchTrainings();
        } catch (error) {
            console.error('Error saving training:', error);
            alert('Failed to save training.');
        }
    };

    const handleEdit = (training) => {
        setFormData({
            employeeName: training.employeeName,
            trainingTopic: training.trainingTopic,
            completionDate: training.completionDate ? training.completionDate.split('T')[0] : '',
            status: training.status,
        });
        setEditingId(training._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        setDeleteModal({
            isOpen: true,
            type: 'single',
            id: id,
            count: 1
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setDeleteModal({
            isOpen: true,
            type: 'bulk',
            id: null,
            count: selectedIds.length
        });
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            if (deleteModal.type === 'single') {
                await api.delete(`/training/${deleteModal.id}`);
                setSelectedIds(selectedIds.filter(id => id !== deleteModal.id));
            } else {
                await api.post('/training/bulk-delete', { ids: selectedIds });
                setSelectedIds([]);
            }
            fetchTrainings();
            setDeleteModal({ isOpen: false, type: null, id: null, count: 0 });
        } catch (error) {
            console.error('Error deleting training:', error);
            alert('Failed to delete.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentItems.map(t => t._id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ employeeName: '', trainingTopic: '', completionDate: '', status: 'Scheduled' });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Training Schedule', 14, 10);

        const tableColumn = ["Employee Name", "Topic", "Date", "Status"];
        const tableRows = filteredTrainings.map(t => [
            t.employeeName,
            t.trainingTopic,
            new Date(t.completionDate).toLocaleDateString(),
            t.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('training_schedule.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Employee Training</h2>
                    <p className="text-gray-500 text-sm">Schedule and track skill development.</p>
                </div>
                {/* Removed Add Session button from here as it is handled by the form */}
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-cyan-400 ring-1 ring-cyan-400' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Session' : 'Schedule New Training'}</h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="employeeName" placeholder="Employee Name" value={formData.employeeName} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    <input type="text" name="trainingTopic" placeholder="Topic (e.g. Security)" value={formData.trainingTopic} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    <input type="date" name="completionDate" placeholder="Date" value={formData.completionDate} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    {editingId && (
                        <select name="status" value={formData.status} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    )}

                    <button type="submit" className={`col-span-1 md:col-span-2 py-3 rounded-xl font-semibold transition-colors text-white mt-2 ${editingId ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                        {editingId ? 'Update Session' : 'Schedule'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full xl:w-auto">
                        <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">Training Schedule</h3>
                        <div className="flex gap-2">
                            <button onClick={exportToPDF} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
                                <Download size={16} />
                                Export PDF
                            </button>
                            {selectedIds.length > 0 && (
                                <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors text-sm">
                                    <Trash2 size={16} />
                                    Delete ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-full md:w-64">
                            <Search size={18} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search training..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent outline-none text-sm text-gray-600 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="py-4 px-6 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={currentItems.length > 0 && currentItems.every(t => selectedIds.includes(t._id))}
                                        className="rounded text-cyan-600 focus:ring-cyan-500"
                                    />
                                </th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Employee</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Topic</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Date</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Status</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="py-6 text-center">Loading...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="6" className="py-6 text-center">No scheduled trainings.</td></tr>
                            ) : (
                                currentItems.map((t) => (
                                    <tr key={t._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(t._id)}
                                                onChange={() => handleSelectOne(t._id)}
                                                className="rounded text-cyan-600 focus:ring-cyan-500"
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-800">{t.employeeName}</td>
                                        <td className="py-4 px-6">{t.trainingTopic}</td>
                                        <td className="py-4 px-6 text-gray-500">{new Date(t.completionDate).toLocaleDateString()}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${t.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                                    t.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-cyan-100 text-cyan-600'}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleEdit(t)} className="text-blue-500 hover:text-blue-700 inline-block"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-700 inline-block"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : currentItems.length === 0 ? (
                        <p className="text-center text-gray-500">No scheduled trainings.</p>
                    ) : (
                        currentItems.map((t) => (
                            <div key={t._id} className="bg-white border boundary-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(t._id)}
                                    onChange={() => handleSelectOne(t._id)}
                                    className="absolute top-4 right-4 rounded text-cyan-600 focus:ring-cyan-500"
                                />
                                <div className="flex justify-between items-start pr-8">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{t.employeeName}</h4>
                                        <p className="text-xs text-gray-500">{t.trainingTopic}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${t.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                                            t.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-cyan-100 text-cyan-600'}`}>
                                        {t.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 pt-2 border-t border-gray-50 mt-1">
                                    Date: {new Date(t.completionDate).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => handleEdit(t)} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(t._id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredTrainings.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-6 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-cyan-600'}`}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-cyan-600'}`}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>


            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title={deleteModal.type === 'bulk' ? 'Delete Multiple Sessions?' : 'Delete Session?'}
                message={deleteModal.type === 'bulk'
                    ? `Are you sure you want to delete these ${deleteModal.count} sessions? This action cannot be undone.`
                    : 'Are you sure you want to delete this session? This action cannot be undone.'}
                isDeleting={isDeleting}
            />
        </div >
    );
};

export default Training;
