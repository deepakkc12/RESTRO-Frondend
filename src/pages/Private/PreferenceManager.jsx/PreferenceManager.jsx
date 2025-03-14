import React, { useState, useEffect } from 'react';
import { Search, Edit2, Save, Trash2, Plus, X } from 'lucide-react';
import { useToast } from '../../../hooks/UseToast';
import { getRequest, postRequest } from '../../../services/apis/requests';
import AdminPanelHeader from '../../../components/Headers/AdminPanelHeader';

const PreferenceManager = () => {
  const [skus, setSkus] = useState([]);
  const [filteredSkus, setFilteredSkus] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [editingStates, setEditingStates] = useState({});
  const [editedValues, setEditedValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [newPreference, setNewPreference] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchSKUs();
  }, []);

  useEffect(() => {
    const filtered = skus.filter(sku => 
      sku.SkuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sku.Code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSkus(filtered);
  }, [searchQuery, skus]);

  const fetchSKUs = async () => {
    setLoading(true);
    try {
      const response = await getRequest("menu/master-list/");
      if (response.success) {
        setSkus(response.data);
        setFilteredSkus(response.data);
        setSelectedSKU(response.data[0]);
      }
    } catch (error) {
      toast.error("Failed to fetch SKUs");
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async (skuCode) => {
    setLoading(true);
    try {
      const response = await getRequest(`menu/${skuCode}/preferences/`);
      if (response.success) {
        setPreferences(response.data);
        setEditingStates({});
        setEditedValues({});
      }
    } catch (error) {
      toast.error("Failed to fetch preferences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchPreferences(selectedSKU?.Code);

  },[selectedSKU])

  const handleSKUSelect = (sku) => {
    setSelectedSKU(sku);
  };

  const startEditing = (preference) => {
    setEditingStates(prev => ({ ...prev, [preference.Code]: true }));
    setEditedValues(prev => ({ ...prev, [preference.Code]: preference.Details }));
  };

  const cancelEditing = (preference) => {
    setEditingStates(prev => ({ ...prev, [preference.Code]: false }));
    setEditedValues(prev => ({ ...prev, [preference.Code]: preference.Details }));
  };

  const handleUpdatePreference = async (preference) => {
    try {
      const newDetails = editedValues[preference.Code];
      if (newDetails === preference.Details) {
        cancelEditing(preference);
        return;
      }

      const body = {
        preferenceCode: preference.Code,
        detail: newDetails,
      };
      const response = await postRequest("menu/update-preference/", body);
      if (response.success) {
        toast.success("Preference updated");
        fetchPreferences(selectedSKU.Code);
      }
    } catch (error) {
      toast.error("Failed to update preference");
    }
  };

  const handleRemovePreference = async (preference) => {
    // if (!confirm("Are you sure you want to remove this preference?")) return;
    
    try {
      const body = { preferenceCode: preference.Code };
      const response = await postRequest("menu/remove-preference/", body);
      if (response.success) {
        toast.success("Preference removed");
        fetchPreferences(selectedSKU.Code);
      }
    } catch (error) {
      toast.error("Failed to remove preference");
    }
  };

  const handleAddPreference = async () => {
    if (!newPreference.trim()) {
      toast.error("Please enter a preference");
      return;
    }

    setLoading(true);
    try {
      const body = {
        skuCode: selectedSKU.Code,
        detail: newPreference,
      };
      const response = await postRequest("menu/add-preference/", body);
      if (response.success) {
        fetchPreferences(selectedSKU.Code);
        setNewPreference("");
        toast.success("Preference added");
      }
    } catch (error) {
      toast.error("Failed to add preference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  ">
        <AdminPanelHeader/>
      <div className=" mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo-900">Preference Manager</h1>
          <p className="text-indigo-600">Manage SKU preferences and details</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SKU Selection Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4">SKUs</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search SKUs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredSkus.map((sku) => (
                <button
                  key={sku.Code}
                  onClick={() => handleSKUSelect(sku)}
                  className={`w-full p-4 rounded-lg transition-all transform  ${
                    selectedSKU?.Code === sku.Code
                      ? "bg-indigo-100 border-2 border-indigo-500 text-indigo-900"
                      : "bg-white border border-indigo-100 hover:border-indigo-300 text-gray-700 hover:bg-indigo-50"
                  }`}
                >
                  <div className="flex items-center gap-1 text-left">
                  {/* <span className="text-sm text-indigo-500">{sku.Code}</span> */}

                    <span className="font-semibold">{sku.SkuName}</span>

                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preferences Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 border border-indigo-100">
            <h2 className="text-xl font-semibold text-indigo-900 mb-6">
              {selectedSKU ? `Preferences for ${selectedSKU.SkuName}` : "Select a SKU"}
            </h2>
            
            {selectedSKU ? (
              <div className="space-y-4">
                {/* Existing Preferences */}
                <div className="space-y-3">
                  {preferences.map((pref) => (
                    <div
                      key={pref.Code}
                      className={`group p-3 rounded-lg transition-all ${
                        editingStates[pref.Code]
                          ? "bg-blue-50 border-2 border-blue-400"
                          : "bg-white border border-indigo-100 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          value={editingStates[pref.Code] ? editedValues[pref.Code] : pref.Details}
                          onChange={(e) => setEditedValues(prev => ({ 
                            ...prev, 
                            [pref.Code]: e.target.value 
                          }))}
                          disabled={!editingStates[pref.Code]}
                          className={`flex-1 px-3 py-2 rounded-md ${
                            editingStates[pref.Code]
                              ? "border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              : "bg-gray-50 border border-transparent"
                          }`}
                        />
                        <div className="flex gap-2">
                          {editingStates[pref.Code] ? (
                            <>
                              <button
                                onClick={() => handleUpdatePreference(pref)}
                                className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => cancelEditing(pref)}
                                className="p-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(pref)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemovePreference(pref)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Preference */}
                <div className="flex gap-2 mt-6">
                  <input
                    value={newPreference}
                    onChange={(e) => setNewPreference(e.target.value)}
                    placeholder="Add new preference"
                    className="flex-1 px-4 py-3 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30"
                  />
                  <button
                    onClick={handleAddPreference}
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-indigo-400 bg-indigo-50/50 rounded-lg border-2 border-dashed border-indigo-200">
                Select a SKU from the list to manage its preferences
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceManager;