import connectDB from './db';
import Attendance from './models/Attendance';
import Client from './models/Client';

export interface Attendance {
  id: string;
  clientId: string;
  clientName?: string;
  photoUrl?: string;
  attendanceDate: string;
  inTime: string;
  outTime?: string;
  status: 'IN' | 'OUT';
  duration?: string; // Duration in hours and minutes (e.g., "2h 30m")
  createdAt: string;
}

/**
 * Auto-checkout clients who are still IN at the end of the day
 * This function checks for attendance records that are still "IN" status
 * for dates before today, or for today if it's past the end of day time
 */
export async function autoCheckoutEndOfDay(endOfDayTime: string = '23:59:59'): Promise<number> {
  await connectDB();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Parse end of day time
  const [hours, minutes, seconds] = endOfDayTime.split(':').map(Number);
  const todayEndTime = new Date(today);
  todayEndTime.setHours(hours, minutes || 0, seconds || 0, 0);
  
  // Find all attendance records that are still IN
  // We need to check records for:
  // 1. Dates before today (definitely need checkout)
  // 2. Today if current time is past end of day time
  
  // Get all IN records without outTime
  const pendingCheckouts = await Attendance.find({
    status: 'IN',
    $or: [
      { outTime: { $exists: false } },
      { outTime: null }
    ]
  }).lean();
  
  let checkedOutCount = 0;
  
  for (const record of pendingCheckouts) {
    const attendanceDate = new Date(record.attendanceDate);
    const recordDate = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());
    const recordDateOnly = recordDate.getTime();
    const todayOnly = today.getTime();
    
    // Determine if this record needs to be checked out
    let shouldCheckout = false;
    
    if (recordDateOnly < todayOnly) {
      // Previous day - definitely needs checkout
      shouldCheckout = true;
    } else if (recordDateOnly === todayOnly) {
      // Today - checkout if current time is past end of day
      if (now > todayEndTime) {
        shouldCheckout = true;
      }
    }
    
    if (shouldCheckout) {
      // Update the record with OUT status and end of day time
      await Attendance.findByIdAndUpdate(record._id, {
        status: 'OUT',
        outTime: endOfDayTime,
      });
      
      checkedOutCount++;
    }
  }
  
  return checkedOutCount;
}

export async function getAllAttendance(): Promise<Attendance[]> {
  await connectDB();
  
  // Auto-checkout any pending records before fetching
  await autoCheckoutEndOfDay();
  
  const attendance = await Attendance.find()
    .populate('clientId', 'firstName lastName clientId')
    .sort({ attendanceDate: -1, inTime: -1 })
    .lean();
  
  return attendance.map(mapToAttendance);
}

export async function getAttendanceByClientId(clientId: string | number): Promise<Attendance[]> {
  await connectDB();
  
  // Auto-checkout any pending records before fetching
  await autoCheckoutEndOfDay();
  
  // Convert clientId to number if it's a string
  const clientIdNum = typeof clientId === 'string' ? parseInt(clientId) : clientId;
  
  // Find client by clientId (running number) or MongoDB _id
  let client;
  if (!isNaN(clientIdNum) && clientIdNum > 0 && clientIdNum < 100000) {
    // It's a running clientId number
    client = await Client.findOne({ clientId: clientIdNum });
  } else {
    // It might be a MongoDB ObjectId string
    client = await Client.findById(clientId);
  }
  
  if (!client) {
    return []; // Return empty array if client not found
  }
  
  // Use MongoDB _id for querying attendance
  const clientMongoId = client._id;
  
  const attendance = await Attendance.find({ clientId: clientMongoId })
    .populate('clientId', 'firstName lastName clientId')
    .sort({ attendanceDate: -1, inTime: -1 })
    .lean();
  
  return attendance.map(mapToAttendance);
}

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  await connectDB();
  
  // Auto-checkout any pending records before fetching
  await autoCheckoutEndOfDay();
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const attendance = await Attendance.find({
    attendanceDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .populate('clientId', 'firstName lastName clientId')
    .sort({ inTime: -1 })
    .lean();
  
  return attendance.map(mapToAttendance);
}

export async function addAttendance(attendanceData: {
  clientId: string | number;
  attendanceDate: string;
  attendanceTime: string;
}): Promise<Attendance> {
  await connectDB();
  
  // Auto-checkout any pending records before adding new attendance
  await autoCheckoutEndOfDay();
  
  // Convert clientId to number if it's a string
  const clientIdNum = typeof attendanceData.clientId === 'string' 
    ? parseInt(attendanceData.clientId) 
    : attendanceData.clientId;
  
  // Find client by clientId (running number) or MongoDB _id
  let client;
  if (!isNaN(clientIdNum) && clientIdNum > 0 && clientIdNum < 100000) {
    // It's a running clientId number
    client = await Client.findOne({ clientId: clientIdNum });
  } else {
    // It might be a MongoDB ObjectId string
    client = await Client.findById(attendanceData.clientId);
  }
  
  if (!client) {
    throw new Error(`Client with ID ${attendanceData.clientId} not found`);
  }
  
  // Use MongoDB _id for the attendance record
  const clientMongoId = client._id;
  
  // Normalize date to start of day for comparison and storage
  const attendanceDate = new Date(attendanceData.attendanceDate);
  attendanceDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(attendanceDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Check if attendance record exists for this client and date
  const existingAttendance = await Attendance.findOne({
    clientId: clientMongoId,
    attendanceDate: {
      $gte: attendanceDate,
      $lt: nextDay,
    },
  });
  
  let attendance;
  
  if (existingAttendance) {
    // Toggle status: if IN, change to OUT; if OUT, change to IN
    if (existingAttendance.status === 'IN') {
      // Setting OUT time
      existingAttendance.status = 'OUT';
      existingAttendance.outTime = attendanceData.attendanceTime;
    } else {
      // Toggling back to IN (shouldn't normally happen, but handle it)
      existingAttendance.status = 'IN';
      existingAttendance.inTime = attendanceData.attendanceTime;
      existingAttendance.outTime = undefined;
    }
    await existingAttendance.save();
    await existingAttendance.populate('clientId', 'firstName lastName clientId');
    attendance = existingAttendance.toObject();
  } else {
    // Create new record with IN status (date normalized to start of day)
    attendance = new Attendance({
      clientId: clientMongoId,
      attendanceDate: attendanceDate, // Use normalized date
      inTime: attendanceData.attendanceTime,
      status: 'IN',
    });
    
    await attendance.save();
    await attendance.populate('clientId', 'firstName lastName clientId');
    attendance = attendance.toObject();
  }
  
  return mapToAttendance(attendance);
}

export async function deleteAttendance(id: string): Promise<boolean> {
  await connectDB();
  const result = await Attendance.findByIdAndDelete(id);
  return !!result;
}

function calculateDuration(inTime: string, outTime: string): string {
  try {
    const [inHours, inMinutes] = inTime.split(':').map(Number);
    const [outHours, outMinutes] = outTime.split(':').map(Number);
    
    const inDate = new Date();
    inDate.setHours(inHours, inMinutes, 0, 0);
    
    const outDate = new Date();
    outDate.setHours(outHours, outMinutes, 0, 0);
    
    // If out time is earlier than in time, assume next day
    if (outDate < inDate) {
      outDate.setDate(outDate.getDate() + 1);
    }
    
    const diffMs = outDate.getTime() - inDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `${diffMinutes}m`;
    } else if (diffMinutes === 0) {
      return `${diffHours}h`;
    } else {
      return `${diffHours}h ${diffMinutes}m`;
    }
  } catch (error) {
    console.error('Error calculating duration:', error);
    return '';
  }
}

function mapToAttendance(attendance: any): Attendance {
  const client = attendance.clientId;
  const clientName = client
    ? `${client.firstName || ''} ${client.lastName || ''}`.trim()
    : undefined;
  
  // Return clientId (running number) instead of MongoDB _id
  const clientId = client?.clientId 
    ? client.clientId.toString() 
    : (attendance.clientId?._id?.toString() || attendance.clientId?.toString() || '');
  
  const photoUrl = client?.photoUrl || undefined;
  
  const inTime = attendance.inTime || attendance.attendanceTime || ''; // Fallback for old records
  const outTime = attendance.outTime || undefined;
  const status = attendance.status || 'IN';
  
  // Calculate duration if OUT
  const duration = status === 'OUT' && inTime && outTime 
    ? calculateDuration(inTime, outTime)
    : undefined;
  
  return {
    id: attendance._id.toString(),
    clientId: clientId,
    clientName,
    photoUrl,
    attendanceDate: attendance.attendanceDate
      ? attendance.attendanceDate.toISOString().split('T')[0]
      : '',
    inTime: inTime,
    outTime: outTime,
    status: status,
    duration: duration,
    createdAt: attendance.createdAt ? attendance.createdAt.toISOString() : new Date().toISOString(),
  };
}
