const { success } = require('../helpers/handler')
const Address = require('../models/address')
const axios = require('axios')
axios.defaults.baseURL = 'http://dev.farizdotid.com/api/daerahindonesia/'

// Get array of provinsi
exports.getProvinces = async (req, res, next) => {
  try {
    const provinces = await axios.get('/provinsi')
    success(res, 200, provinces.data.semuaprovinsi)
  } catch (err) {
    next(err)
  }
}

// Get array of Kabupaten
exports.getDistricts = async (req, res, next) => {
  const { prov_id } = req.params
  try {
    const districts = await axios.get(`/provinsi/${prov_id}/kabupaten`)
    success(res, 200, districts.data.kabupatens)
  } catch (err) {
    next(err)
  }
}

// Get array of kecamatan
exports.gerRegencies = async (req, res, next) => {
  const { dist_id } = req.params
  try {
    const districts = await axios.get(`/provinsi/kabupaten/${dist_id}/kecamatan`)
    success(res, 200, districts.data.kecamatans)
  } catch (err) {
    next(err)
  }
}

// Get array of Village
exports.getVillages = async (req, res, next) => {
  const { reg_id } = req.params
  try {
    const districts = await axios.get(`/provinsi/kabupaten/kecamatan/${reg_id}/desa`)
    success(res, 200, districts.data.desas)
  } catch (err) {
    next(err)
  }
}

exports.removeAddress = async (req, res, next) => {
  const { address_id } = req.params

  try {
    const removed = await Address
      .findOneAndDelete({ user_id: req.user._id, _id: address_id })
    success(res, 200, removed)
  } catch (err) {
    next(err)
  }
}
