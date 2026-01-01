import React, { useState, useEffect } from 'react';
import api from '../api';
import { LifeBuoy, Plus, Search, Download, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const ITSupport = () => {
    const [incidents, setIncidents] = useState([]);
    const [formData, setFormData] = useState({
        requesterName: '',
        priority: 'Medium',
        issueDescription: '',
        status: 'Open',
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

    const fetchIncidents = async () => {
        try {
            const response = await api.get('/incidents');
            setIncidents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching incidents:', error);
            setLoading(false);
        }
    };

    const filteredIncidents = incidents.filter(i =>
        (statusFilter === 'All' || i.status === statusFilter) &&
        (i.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.issueDescription.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredIncidents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing incident
                await api.put(`/incidents/${editingId}`, formData);
                setEditingId(null);
            } else {
                // Create new incident
                await api.post('/incidents', formData);
            }
            setFormData({ requesterName: '', priority: 'Medium', issueDescription: '', status: 'Open' });
            fetchIncidents();
        } catch (error) {
            console.error('Error saving incident:', error);
            alert('Failed to save incident.');
        }
    };

    const handleEdit = (incident) => {
        setFormData({
            requesterName: incident.requesterName,
            priority: incident.priority,
            issueDescription: incident.issueDescription,
            status: incident.status,
        });
        setEditingId(incident._id);
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
                await api.delete(`/incidents/${deleteModal.id}`);
                setSelectedIds(selectedIds.filter(id => id !== deleteModal.id));
            } else {
                await api.post('/incidents/bulk-delete', { ids: selectedIds });
                setSelectedIds([]);
            }
            fetchIncidents();
            setDeleteModal({ isOpen: false, type: null, id: null, count: 0 });
        } catch (error) {
            console.error('Error deleting incidents:', error);
            alert('Failed to delete.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentItems.map(i => i._id);
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
        setFormData({ requesterName: '', priority: 'Medium', issueDescription: '', status: 'Open' });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('IT Incidents Report', 14, 10);

        const tableColumn = ["Requester", "Priority", "Description", "Status"];
        const tableRows = filteredIncidents.map(i => [
            i.requesterName,
            i.priority,
            i.issueDescription,
            i.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('incidents.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Incident Management</h2>
                    <p className="text-gray-500 text-sm">Track and resolve IT support tickets.</p>
                </div>
                {/* Removed Add Ticket button from here as it is handled by the form */}
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Ticket' : 'Report New Issue'}</h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="requesterName" placeholder="Requester Name" value={formData.requesterName} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    <select name="priority" value={formData.priority} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                        <option value="Critical">Critical</option>
                    </select>
                    <input type="text" name="issueDescription" placeholder="Issue Description" value={formData.issueDescription} onChange={handleChange} className="md:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" required />

                    {editingId && (
                        <select name="status" value={formData.status} onChange={handleChange} className="md:col-span-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    )}

                    <button type="submit" className={`col-span-1 md:col-span-2 py-3 rounded-xl font-semibold transition-colors text-white mt-2 ${editingId ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        {editingId ? 'Update Ticket' : 'Submit Ticket'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full xl:w-auto">
                        <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">Support Tickets</h3>
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
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-full md:w-64">
                            <Search size={18} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
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
                                        checked={currentItems.length > 0 && currentItems.every(i => selectedIds.includes(i._id))}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                </th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Requester</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Priority</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Description</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Status</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="py-6 text-center">Loading...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="6" className="py-6 text-center">No incidents found.</td></tr>
                            ) : (
                                currentItems.map((i) => (
                                    <tr key={i._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(i._id)}
                                                onChange={() => handleSelectOne(i._id)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-800">{i.requesterName}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${i.priority === 'Critical' ? 'bg-red-100 text-red-600' :
                                                    i.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                                                        i.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                                {i.priority}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500 truncate max-w-xs">{i.issueDescription}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${i.status === 'Open' ? 'bg-red-100 text-red-600' :
                                                    i.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                {i.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleEdit(i)} className="text-blue-500 hover:text-blue-700 inline-block"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(i._id)} className="text-red-500 hover:text-red-700 inline-block"><Trash2 size={18} /></button>
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
                        <p className="text-center text-gray-500">No incidents found.</p>
                    ) : (
                        currentItems.map((i) => (
                            <div key={i._id} className="bg-white border boundary-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(i._id)}
                                    onChange={() => handleSelectOne(i._id)}
                                    className="absolute top-4 right-4 rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="flex justify-between items-start pr-8">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{i.requesterName}</h4>
                                        <p className="text-xs text-gray-500">{i.priority} Priority</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${i.status === 'Open' ? 'bg-red-100 text-red-600' :
                                            i.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                        {i.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 pt-2 border-t border-gray-50 mt-1 line-clamp-2">
                                    {i.issueDescription}
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => handleEdit(i)} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(i._id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredIncidents.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-6 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
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
                title={deleteModal.type === 'bulk' ? 'Delete Multiple Incidents?' : 'Delete Incident?'}
                message={deleteModal.type === 'bulk'
                    ? `Are you sure you want to delete these ${deleteModal.count} incidents? This action cannot be undone.`
                    : 'Are you sure you want to delete this incident? This action cannot be undone.'}
                isDeleting={isDeleting}
            />
        </div >
    );
};

export default ITSupport;
