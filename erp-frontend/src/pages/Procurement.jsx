import React, { useState, useEffect } from 'react';
import api from '../api';
import { CreditCard, Plus, Search, Download, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Procurement = () => {
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({
        itemName: '',
        department: '',
        quantity: 1,
        budget: '',
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    const [editingId, setEditingId] = useState(null);

    const [selectedIds, setSelectedIds] = useState([]);

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        type: null,
        id: null,
        count: 0
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/procurement');
            setRequests(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching procurement requests:', error);
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req =>
        (statusFilter === 'All' || req.status === statusFilter) &&
        (req.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/procurement/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/procurement', { ...formData, status: 'Pending' });
            }
            setFormData({ itemName: '', department: '', quantity: 1, budget: '' });
            fetchRequests();
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to save request.');
        }
    };

    const handleEdit = (req) => {
        setFormData({
            itemName: req.itemName,
            department: req.department,
            quantity: req.quantity,
            budget: req.budget,
        });
        setEditingId(req._id);
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
                await api.delete(`/procurement/${deleteModal.id}`);
                setSelectedIds(selectedIds.filter(id => id !== deleteModal.id));
            } else {
                await api.post('/procurement/bulk-delete', { ids: selectedIds });
                setSelectedIds([]);
            }
            fetchRequests();
            setDeleteModal({ isOpen: false, type: null, id: null, count: 0 });
        } catch (error) {
            console.error('Error deleting requests:', error);
            alert('Failed to delete.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentItems.map(req => req._id);
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
        setFormData({ itemName: '', department: '', quantity: 1, budget: '' });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Procurement Report', 14, 10);

        const tableColumn = ["Item Name", "Department", "Quantity", "Budget", "Status"];
        const tableRows = filteredRequests.map(req => [
            req.itemName,
            req.department,
            req.quantity,
            `$${req.budget}`,
            req.status
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('procurement_requests.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Procurement</h2>
                    <p className="text-gray-500 text-sm">Manage purchase requests and company spending.</p>
                </div>
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-orange-400 ring-1 ring-orange-400' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Request' : 'Create Purchase Request'}</h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="itemName" placeholder="Item Name / Service" value={formData.itemName} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <input type="text" name="department" placeholder="Department (e.g. IT, HR)" value={formData.department} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required />
                    <input type="number" name="budget" placeholder="Estimated Budget ($)" value={formData.budget} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500" required />

                    <button type="submit" className={`col-span-1 md:col-span-2 py-3 rounded-xl font-semibold transition-colors text-white mt-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'}`}>
                        {editingId ? 'Update Request' : 'Submit Request'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full xl:w-auto">
                        <h3 className="text-lg font-bold text-gray-800 whitespace-nowrap">Pending Requests</h3>
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
                            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5 outline-none"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-full md:w-64">
                            <Search size={18} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent outline-none text-sm text-gray-600 w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="py-4 px-6 w-10">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={currentItems.length > 0 && currentItems.every(req => selectedIds.includes(req._id))}
                                        className="rounded text-orange-600 focus:ring-orange-500"
                                    />
                                </th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Item</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Department</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Qty</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Budget</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Status</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="py-6 text-center">Loading...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="7" className="py-6 text-center">No pending requests.</td></tr>
                            ) : (
                                currentItems.map((req) => (
                                    <tr key={req._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(req._id)}
                                                onChange={() => handleSelectOne(req._id)}
                                                className="rounded text-orange-600 focus:ring-orange-500"
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-800">{req.itemName}</td>
                                        <td className="py-4 px-6">{req.department}</td>
                                        <td className="py-4 px-6">{req.quantity}</td>
                                        <td className="py-4 px-6 font-semibold">${req.budget}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                                ${req.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                                    req.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                            <button onClick={() => handleEdit(req)} className="text-blue-500 hover:text-blue-700 inline-block"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(req._id)} className="text-red-500 hover:text-red-700 inline-block"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden p-4 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading...</p>
                    ) : currentItems.length === 0 ? (
                        <p className="text-center text-gray-500">No pending requests.</p>
                    ) : (
                        currentItems.map((req) => (
                            <div key={req._id} className="bg-white border boundary-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(req._id)}
                                    onChange={() => handleSelectOne(req._id)}
                                    className="absolute top-4 right-4 rounded text-orange-600 focus:ring-orange-500"
                                />
                                <div className="flex justify-between items-start pr-8">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{req.itemName}</h4>
                                        <p className="text-xs text-gray-500">{req.department} • Qty: {req.quantity}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                        ${req.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                            req.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold text-gray-800 pt-2 border-t border-gray-50 mt-1">
                                    Budget: ${req.budget}
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => handleEdit(req)} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(req._id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredRequests.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-6 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-orange-600'}`}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-orange-600'}`}
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
                title={deleteModal.type === 'bulk' ? 'Delete Multiple Requests?' : 'Delete Request?'}
                message={deleteModal.type === 'bulk'
                    ? `Are you sure you want to delete these ${deleteModal.count} requests? This action cannot be undone.`
                    : 'Are you sure you want to delete this request? This action cannot be undone.'}
                isDeleting={isDeleting}
            />
        </div >
    );
};

export default Procurement;
