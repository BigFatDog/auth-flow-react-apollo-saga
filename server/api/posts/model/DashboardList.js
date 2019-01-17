import mongoose, { Schema } from 'mongoose';

const DashboardListSchema = new Schema(
  {
    _id: String,
    name: String,
    userId: String,
    creatorId: String,
    favorite: Boolean,
    createdAt: Date,
    updatedAt: Date,
    refreshedAt: Date,
    coverImage: String,
    charts: Array,
  },
  { collection: 'DashboardList' }
);

const DashboardList = mongoose.model('DashboardList', DashboardListSchema);

export default DashboardList;
