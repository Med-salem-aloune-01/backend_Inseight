import Department from '../models/Department.js';

export const createDepartment = async (req, res, next) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (error) { next(error); }
};

export const getDepartments = async (req, res, next) => {
  try {
    const depts = await Department.find();
    res.status(200).json({ success: true, data: depts });
  } catch (error) { next(error); }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: dept });
  } catch (error) { next(error); }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Département supprimé' });
  } catch (error) { next(error); }
};
