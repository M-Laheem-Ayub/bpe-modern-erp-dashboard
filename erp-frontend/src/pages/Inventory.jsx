import React, { useState, useEffect } from 'react';
import api from '../api';
import { Package, Plus, Search, Download, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        itemName: '',
        sku: '',
        currentStock: '',
        unitPrice: '',
        supplier: '',
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const fetchItems = async () => {
        try {
            const response = await api.get('/inventory');
            setItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    useEffect(() => {
        fetchItems();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/inventory/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/inventory', formData);
            }
            setFormData({ itemName: '', sku: '', currentStock: '', unitPrice: '', supplier: '' });
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Failed to save item. Ensure SKU is unique.');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            itemName: item.itemName,
            sku: item.sku,
            currentStock: item.currentStock,
            unitPrice: item.unitPrice,
            supplier: item.supplier,
        });
        setEditingId(item._id);
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
                await api.delete(`/inventory/${deleteModal.id}`);
                setSelectedIds(selectedIds.filter(id => id !== deleteModal.id));
            } else {
                await api.post('/inventory/bulk-delete', { ids: selectedIds });
                setSelectedIds([]);
            }
            fetchItems();
            setDeleteModal({ isOpen: false, type: null, id: null, count: 0 });
        } catch (error) {
            console.error('Error deleting items:', error);
            alert('Failed to delete.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = currentItems.map(item => item._id);
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
        setFormData({ itemName: '', sku: '', currentStock: '', unitPrice: '', supplier: '' });
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Inventory Report', 14, 10);

        const tableColumn = ["Item Name", "SKU", "Current Stock", "Unit Price ($)", "Supplier"];
        const tableRows = filteredItems.map(item => [
            item.itemName,
            item.sku,
            item.currentStock,
            item.unitPrice,
            item.supplier
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('inventory.pdf');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
                    <p className="text-gray-500 text-sm">Track and manage your stock levels.</p>
                </div>
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editingId ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">
                            <X size={20} />
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <input type="text" name="sku" placeholder="SKU" value={formData.sku} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <input type="number" name="currentStock" placeholder="Current Stock" value={formData.currentStock} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <input type="number" name="unitPrice" placeholder="Unit Price ($)" value={formData.unitPrice} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <input type="text" name="supplier" placeholder="Supplier" value={formData.supplier} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    <button type="submit" className={`col-span-1 md:col-span-2 lg:col-span-1 py-3 rounded-xl font-semibold transition-colors text-white ${editingId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {editingId ? 'Update Item' : 'Save Item'}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Current Stock</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
                        <div className="flex gap-2">
                            {selectedIds.length > 0 && (
                                <button onClick={handleBulkDelete} className="bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors text-sm">
                                    <Trash2 size={16} />
                                    Delete ({selectedIds.length})
                                </button>
                            )}
                            <button onClick={exportToPDF} className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
                                <Download size={16} />
                                Export PDF
                            </button>

                        </div>
                        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 w-full md:w-64">
                            <Search size={18} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search items..."
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
                                        checked={currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item._id))}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Item Name</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">SKU</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Stock</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Price</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase">Supplier</th>
                                <th className="py-4 px-6 font-medium text-xs uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="py-6 text-center">Loading...</td></tr>
                            ) : currentItems.length === 0 ? (
                                <tr><td colSpan="7" className="py-6 text-center">No items found.</td></tr>
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item._id)}
                                                onChange={() => handleSelectOne(item._id)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-800">{item.itemName}</td>
                                        <td className="py-4 px-6">{item.sku}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.currentStock < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {item.currentStock}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">${item.unitPrice}</td>
                                        <td className="py-4 px-6">{item.supplier}</td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
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
                        <p className="text-center text-gray-500">No items found.</p>
                    ) : (
                        currentItems.map((item) => (
                            <div key={item._id} className="bg-white border boundary-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item._id)}
                                    onChange={() => handleSelectOne(item._id)}
                                    className="absolute top-4 right-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex justify-between items-start pr-8">
                                    <div>
                                        <h4 className="font-bold text-gray-800">{item.itemName}</h4>
                                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.currentStock < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        Stock: {item.currentStock}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50 mt-1">
                                    <span className="text-gray-500">Price: <span className="text-gray-800 font-medium">${item.unitPrice}</span></span>
                                    <span className="text-gray-500">Supplier: <span className="text-gray-800 font-medium">{item.supplier}</span></span>
                                </div>
                                <div className="flex gap-2 justify-end mt-2">
                                    <button onClick={() => handleEdit(item)} className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(item._id)} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredItems.length > itemsPerPage && (
                    <div className="flex justify-between items-center p-6 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-blue-600'}`}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-blue-600'}`}
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
                title={deleteModal.type === 'bulk' ? 'Delete Multiple Items?' : 'Delete Item?'}
                message={deleteModal.type === 'bulk'
                    ? `Are you sure you want to delete these ${deleteModal.count} items? This action cannot be undone.`
                    : 'Are you sure you want to delete this item? This action cannot be undone.'}
                isDeleting={isDeleting}
            />
        </div >
    );
};

export default Inventory;
