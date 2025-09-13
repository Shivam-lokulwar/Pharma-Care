import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, User, Calendar, Phone, MapPin } from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    prescriptionNumber: '',
    patientName: '',
    patientPhone: '',
    patientAge: '',
    doctorName: '',
    doctorPhone: '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
    status: 'pending'
  });

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = () => {
    const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    if (savedPrescriptions.length === 0) {
      const mockPrescriptions = [
        {
          id: 1,
          prescriptionNumber: 'RX-001',
          patientName: 'Rajesh Kumar',
          patientPhone: '+91-98765-43210',
          patientAge: 45,
          doctorName: 'Dr. Priya Sharma',
          doctorPhone: '+91-98765-43220',
          diagnosis: 'Hypertension',
          medicines: [
            { name: 'Lisinopril 10mg', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
            { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '30 days' }
          ],
          notes: 'Monitor blood pressure weekly',
          status: 'completed',
          createdAt: '2024-01-15T09:30:00Z',
          createdBy: 'Admin'
        },
        {
          id: 2,
          prescriptionNumber: 'RX-002',
          patientName: 'Priya Singh',
          patientPhone: '+91-98765-43211',
          patientAge: 32,
          doctorName: 'Dr. Amit Patel',
          doctorPhone: '+91-98765-43221',
          diagnosis: 'Common Cold',
          medicines: [
            { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'Every 6 hours', duration: '7 days' },
            { name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once daily', duration: '7 days' }
          ],
          notes: 'Rest and plenty of fluids',
          status: 'pending',
          createdAt: '2024-01-14T14:20:00Z',
          createdBy: 'Admin'
        },
        {
          id: 3,
          prescriptionNumber: 'RX-003',
          patientName: 'Amit Kumar',
          patientPhone: '+91-98765-43212',
          patientAge: 58,
          doctorName: 'Dr. Neha Gupta',
          doctorPhone: '+91-98765-43222',
          diagnosis: 'Diabetes Type 2',
          medicines: [
            { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily', duration: '90 days' },
            { name: 'Glipizide 5mg', dosage: '5mg', frequency: 'Once daily', duration: '90 days' }
          ],
          notes: 'Monitor blood sugar levels',
          status: 'completed',
          createdAt: '2024-01-13T16:45:00Z',
          createdBy: 'Admin'
        }
      ];
      localStorage.setItem('prescriptions', JSON.stringify(mockPrescriptions));
      setPrescriptions(mockPrescriptions);
    } else {
      setPrescriptions(savedPrescriptions);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.doctorName.trim()) return;

    const newPrescription = {
      id: editingPrescription ? editingPrescription.id : Date.now(),
      prescriptionNumber: editingPrescription ? editingPrescription.prescriptionNumber : `RX-${String(Date.now()).slice(-3)}`,
      ...formData,
      createdAt: editingPrescription ? editingPrescription.createdAt : new Date().toISOString(),
      createdBy: 'Admin'
    };

    if (editingPrescription) {
      setPrescriptions(prescriptions.map(prescription => prescription.id === editingPrescription.id ? newPrescription : prescription));
    } else {
      setPrescriptions([...prescriptions, newPrescription]);
    }

    localStorage.setItem('prescriptions', JSON.stringify(editingPrescription ? 
      prescriptions.map(prescription => prescription.id === editingPrescription.id ? newPrescription : prescription) : 
      [...prescriptions, newPrescription]
    ));

    setShowModal(false);
    setEditingPrescription(null);
    setFormData({
      prescriptionNumber: '',
      patientName: '',
      patientPhone: '',
      patientAge: '',
      doctorName: '',
      doctorPhone: '',
      diagnosis: '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: '',
      status: 'pending'
    });
  };

  const handleEdit = (prescription) => {
    setEditingPrescription(prescription);
    setFormData({
      prescriptionNumber: prescription.prescriptionNumber,
      patientName: prescription.patientName,
      patientPhone: prescription.patientPhone,
      patientAge: prescription.patientAge,
      doctorName: prescription.doctorName,
      doctorPhone: prescription.doctorPhone,
      diagnosis: prescription.diagnosis,
      medicines: prescription.medicines,
      notes: prescription.notes,
      status: prescription.status
    });
    setShowModal(true);
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedicine = (index) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      medicines: newMedicines
    });
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setFormData({
      ...formData,
      medicines: newMedicines
    });
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPrescriptions = prescriptions.length;
  const completedPrescriptions = prescriptions.filter(p => p.status === 'completed').length;
  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Prescription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{totalPrescriptions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedPrescriptions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPrescriptions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicines</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prescription.prescriptionNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{prescription.patientName}</div>
                    <div className="text-sm text-gray-500">Age: {prescription.patientAge}</div>
                    <div className="text-sm text-gray-500">{prescription.patientPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{prescription.doctorName}</div>
                    <div className="text-sm text-gray-500">{prescription.doctorPhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{prescription.diagnosis}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{prescription.medicines.length} medicines</div>
                    <div className="text-sm text-gray-500">
                      {prescription.medicines.map(med => med.name).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      prescription.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : prescription.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prescription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(prescription.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(prescription)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingPrescription ? 'Edit Prescription' : 'New Prescription'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Phone</label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Age</label>
                  <input
                    type="number"
                    value={formData.patientAge}
                    onChange={(e) => setFormData({...formData, patientAge: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Phone</label>
                  <input
                    type="tel"
                    value={formData.doctorPhone}
                    onChange={(e) => setFormData({...formData, doctorPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Medicines</label>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Medicine
                  </button>
                </div>
                {formData.medicines.map((medicine, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Medicine Name"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={medicine.dosage}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={medicine.frequency}
                      onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={medicine.duration}
                      onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-600 hover:text-red-800 px-3 py-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPrescription(null);
                    setFormData({
                      prescriptionNumber: '',
                      patientName: '',
                      patientPhone: '',
                      patientAge: '',
                      doctorName: '',
                      doctorPhone: '',
                      diagnosis: '',
                      medicines: [{ name: '', dosage: '', frequency: '', duration: '' }],
                      notes: '',
                      status: 'pending'
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPrescription ? 'Update' : 'Create'} Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescriptions;