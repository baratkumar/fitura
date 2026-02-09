import connectDB from './db';
import Client from './models/Client';
import Membership from './models/Membership';
import { Client as ClientType } from './clientStore.types';

export * from './clientStore.types';

export async function getAllClients(): Promise<ClientType[]> {
  await connectDB();
  const clients = await Client.find({
    clientId: { $exists: true, $ne: null, $gte: 1 } // Only get clients with valid IDs >= 1
  })
    .populate('membershipType', 'name membershipId')
    .sort({ clientId: 1 }) // Sort by clientId instead of createdAt
    .lean();
  
  return clients
    .map(client => {
      try {
        return mapToClientType(client);
      } catch (error) {
        console.error('Skipping invalid client:', error);
        return null;
      }
    })
    .filter((client): client is ClientType => client !== null && client.clientId >= 1);
}

/** Get clients whose membership expires between today and end of next week (same as dashboard "Expiring This Week") */
export async function getExpiringClients(): Promise<ClientType[]> {
  await connectDB();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  const nextWeekEnd = new Date(weekEnd);
  nextWeekEnd.setDate(weekEnd.getDate() + 7);

  const clients = await Client.find({
    clientId: { $exists: true, $ne: null, $gte: 1 },
    expiryDate: { $exists: true, $ne: null, $gte: today, $lte: nextWeekEnd },
  })
    .populate('membershipType', 'name membershipId')
    .sort({ expiryDate: 1, clientId: 1 })
    .lean();

  return clients
    .map(client => {
      try {
        return mapToClientType(client);
      } catch (error) {
        console.error('Skipping invalid client:', error);
        return null;
      }
    })
    .filter((client): client is ClientType => client !== null && client.clientId >= 1);
}

export async function getClient(id: string): Promise<ClientType | null> {
  await connectDB();
  // Try to find by clientId first (if it's a number), otherwise try MongoDB _id
  const clientId = parseInt(id);
  let client;
  
  if (!isNaN(clientId) && clientId > 0 && clientId < 100000) {
    client = await Client.findOne({ clientId })
      .populate('membershipType', 'name membershipId')
      .select('+photoUrl') // Explicitly include photoUrl
      .lean();
  } else {
    client = await Client.findById(id)
      .populate('membershipType', 'name membershipId')
      .select('+photoUrl') // Explicitly include photoUrl
      .lean();
  }
  
  if (!client) return null;
  console.log('[getClient] Retrieved client. clientId:', client.clientId, 'photoUrl:', client.photoUrl, 'typeof photoUrl:', typeof client.photoUrl);
  const mappedClient = mapToClientType(client);
  console.log('[getClient] Mapped client. photoUrl:', mappedClient.photoUrl);
  return mappedClient;
}

/**
 * Find the next available client ID by checking for gaps in the sequence
 * Always starts from 1 and finds the first available number
 */
async function getNextAvailableClientId(): Promise<number> {
  await connectDB();
  
  // Get all existing client IDs, sorted
  const existingClients = await Client.find({}, { clientId: 1 })
    .sort({ clientId: 1 })
    .lean();
  
  // Filter out any null/undefined/0 values and get valid client IDs
  const existingIds = existingClients
    .map((c: any) => c.clientId)
    .filter((id: any) => id != null && id > 0 && Number.isInteger(id))
    .sort((a: number, b: number) => a - b);
  
  // If no clients exist, start with 1
  if (existingIds.length === 0) {
    return 1;
  }
  
  // Always start checking from 1
  // Find the first gap in the sequence starting from 1
  for (let i = 1; i <= existingIds.length; i++) {
    if (!existingIds.includes(i)) {
      return i;
    }
  }
  
  // No gaps found, return max + 1
  const maxId = Math.max(...existingIds);
  return maxId + 1;
}

export async function addClient(clientData: Omit<ClientType, 'clientId' | 'createdAt' | 'updatedAt'>): Promise<ClientType> {
  await connectDB();
  
  // Get the next available client ID (always starts from 1)
  const clientId = await getNextAvailableClientId();
  
  // Ensure clientId is at least 1
  if (clientId < 1) {
    throw new Error('Invalid client ID generated. Client IDs must start from 1.');
  }
  
  // Convert membershipId to MongoDB ObjectId if it's a number
  let membershipTypeId = clientData.membershipType;
  if (membershipTypeId) {
    const membershipId = parseInt(membershipTypeId);
    // Validate that it's a reasonable membershipId (should be a small positive integer, not a huge number)
    // Membership IDs should be reasonable (e.g., 1-10000), not MongoDB ObjectIds
    if (!isNaN(membershipId) && membershipId > 0 && membershipId < 100000) {
      // Find membership by membershipId and get its MongoDB _id
      const membership = await Membership.findOne({ membershipId });
      if (membership) {
        membershipTypeId = membership._id.toString();
      } else {
        throw new Error(`Membership with ID ${membershipId} not found`);
      }
    } else if (membershipTypeId.length === 24) {
      // If it's a 24-character string, it might be a MongoDB ObjectId
      // Try to find membership by MongoDB _id directly
      try {
        const membership = await Membership.findById(membershipTypeId);
        if (membership) {
          membershipTypeId = membership._id.toString();
        } else {
          throw new Error(`Membership not found`);
        }
      } catch (error) {
        throw new Error(`Invalid membership ID format. Please select a valid membership.`);
      }
    } else {
      throw new Error(`Invalid membership ID: ${membershipTypeId}. Please select a valid membership.`);
    }
  }
  
  // Verify clientId is valid before creating
  if (!clientId || clientId < 1 || !Number.isInteger(clientId)) {
    throw new Error(`Invalid clientId generated: ${clientId}. Must be an integer >= 1.`);
  }
  
  console.log(`Creating client with clientId: ${clientId}`);
  
  const clientDataToSave: any = {
    clientId,
    firstName: clientData.firstName,
    lastName: clientData.lastName,
    email: clientData.email,
    phone: clientData.phone,
    dateOfBirth: new Date(clientData.dateOfBirth),
    address: clientData.address,
    emergencyContactName: clientData.emergencyContactName,
    emergencyContactPhone: clientData.emergencyContactPhone,
  };
  
  // Add optional fields only if they exist
  if (clientData.age !== undefined) clientDataToSave.age = clientData.age;
  if (clientData.height !== undefined) clientDataToSave.height = clientData.height;
  if (clientData.weight !== undefined) clientDataToSave.weight = clientData.weight;
  if (clientData.gender) clientDataToSave.gender = clientData.gender;
  if (clientData.bloodGroup) clientDataToSave.bloodGroup = clientData.bloodGroup;
  if (clientData.bmi !== undefined) clientDataToSave.bmi = clientData.bmi;
  if (clientData.aadharNumber) clientDataToSave.aadharNumber = clientData.aadharNumber;
  // Include photoUrl if it's a non-empty string
  // Log the raw value first
  console.log('[addClient] Raw photoUrl value:', clientData.photoUrl, 'typeof:', typeof clientData.photoUrl, 'isString:', typeof clientData.photoUrl === 'string', 'trimmed:', typeof clientData.photoUrl === 'string' ? clientData.photoUrl.trim() : 'N/A');
  
  if (clientData.photoUrl !== undefined && clientData.photoUrl !== null && typeof clientData.photoUrl === 'string' && clientData.photoUrl.trim() !== '') {
    clientDataToSave.photoUrl = clientData.photoUrl.trim();
    console.log('[addClient] ✓ Adding photoUrl to clientDataToSave:', clientData.photoUrl);
  } else {
    console.log('[addClient] ✗ photoUrl NOT added. Reason:', {
      isUndefined: clientData.photoUrl === undefined,
      isNull: clientData.photoUrl === null,
      isString: typeof clientData.photoUrl === 'string',
      isEmpty: typeof clientData.photoUrl === 'string' && clientData.photoUrl.trim() === '',
      value: clientData.photoUrl,
      type: typeof clientData.photoUrl
    });
  }
  if (membershipTypeId) clientDataToSave.membershipType = membershipTypeId;
  if (clientData.joiningDate) clientDataToSave.joiningDate = new Date(clientData.joiningDate);
  if (clientData.expiryDate) clientDataToSave.expiryDate = new Date(clientData.expiryDate);
  if (clientData.membershipFee !== undefined) clientDataToSave.membershipFee = clientData.membershipFee;
  if (clientData.discount !== undefined) clientDataToSave.discount = clientData.discount;
  if (clientData.paymentDate) clientDataToSave.paymentDate = new Date(clientData.paymentDate);
  if (clientData.paymentMode) clientDataToSave.paymentMode = clientData.paymentMode;
  if (clientData.transactionId) clientDataToSave.transactionId = clientData.transactionId;
  if (clientData.paidAmount !== undefined) clientDataToSave.paidAmount = clientData.paidAmount;
  if (clientData.medicalConditions) clientDataToSave.medicalConditions = clientData.medicalConditions;
  if (clientData.fitnessGoals) clientDataToSave.fitnessGoals = clientData.fitnessGoals;
  if (clientData.firstTimeInGym) clientDataToSave.firstTimeInGym = clientData.firstTimeInGym;
  if (clientData.previousGymDetails) clientDataToSave.previousGymDetails = clientData.previousGymDetails;
  
  // Use create() instead of new + save() to ensure all fields are properly saved
  let savedClient;
  try {
    // Use create() which ensures all fields are saved properly
    console.log('[addClient] Creating client with data:', JSON.stringify(clientDataToSave, null, 2));
    const createdClient = await Client.create(clientDataToSave);
    console.log(`[addClient] Client created successfully. clientId: ${createdClient.clientId}, MongoDB _id: ${createdClient._id}, photoUrl: ${createdClient.photoUrl}`);
    
    // Reload with populate to get the complete document
    savedClient = await Client.findById(createdClient._id)
      .populate('membershipType', 'name membershipId')
      .lean();
    console.log(`[addClient] Reloaded client. clientId: ${savedClient?.clientId}, photoUrl: ${savedClient?.photoUrl}`);
    console.log(`[addClient] Full savedClient document keys:`, Object.keys(savedClient || {}));
    console.log(`[addClient] savedClient.photoUrl value:`, savedClient?.photoUrl, 'type:', typeof savedClient?.photoUrl);
  } catch (saveError: any) {
    console.error('Error creating client:', saveError);
    if (saveError.code === 11000) {
      // Duplicate key error - clientId already exists
      if (saveError.keyPattern?.clientId) {
        throw new Error(`Client ID ${clientId} already exists. Please try again.`);
      }
      if (saveError.keyPattern?.email) {
        throw new Error(`A client with this email already exists.`);
      }
      throw new Error(`Duplicate entry. ${saveError.message}`);
    }
    if (saveError.errors) {
      // Validation errors
      const errorMessages = Object.values(saveError.errors).map((err: any) => err.message).join(', ');
      throw new Error(`Validation error: ${errorMessages}`);
    }
    throw saveError;
  }
  
  if (!savedClient) {
    throw new Error('Failed to retrieve saved client from database');
  }
  
  // Double-check clientId is present
  if (!savedClient.clientId || savedClient.clientId < 1) {
    console.error('Retrieved client but clientId is invalid:', {
      clientId: savedClient.clientId,
      mongoId: savedClient._id,
      firstName: savedClient.firstName,
      lastName: savedClient.lastName,
      allFields: Object.keys(savedClient)
    });
    
    // If clientId is still missing, try to update it directly using raw MongoDB update
    // This bypasses Mongoose schema validation
    const mongoose = await import('mongoose');
    const db = mongoose.default.connection.db;
    if (db) {
      await db.collection('clients').updateOne(
        { _id: new mongoose.default.Types.ObjectId(savedClient._id) },
        { $set: { clientId: clientId } }
      );
      
      // Reload again
      savedClient = await Client.findById(savedClient._id)
        .populate('membershipType', 'name membershipId')
        .lean();
    }
    
    if (!savedClient?.clientId || savedClient.clientId < 1) {
      throw new Error(`Client saved but clientId field is missing from database. Expected clientId: ${clientId}. Please restart the server to reload the Client model schema with the clientId field.`);
    }
  }
  
  return mapToClientType(savedClient);
}

export async function deleteClient(id: string): Promise<boolean> {
  await connectDB();
  // Try to find by clientId first (if it's a number), otherwise try MongoDB _id
  const clientId = parseInt(id);
  let result;
  
  if (!isNaN(clientId) && clientId > 0 && clientId < 100000) {
    result = await Client.findOneAndDelete({ clientId });
  } else {
    result = await Client.findByIdAndDelete(id);
  }
  
  return !!result;
}

export async function updateClient(id: string, clientData: Partial<ClientType>): Promise<ClientType | null> {
  await connectDB();
  
  const updateData: any = {};
  
  if (clientData.firstName !== undefined) updateData.firstName = clientData.firstName;
  if (clientData.lastName !== undefined) updateData.lastName = clientData.lastName;
  if (clientData.email !== undefined) updateData.email = clientData.email;
  if (clientData.phone !== undefined) updateData.phone = clientData.phone;
  if (clientData.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(clientData.dateOfBirth);
  if (clientData.age !== undefined) updateData.age = clientData.age;
  if (clientData.height !== undefined) updateData.height = clientData.height;
  if (clientData.weight !== undefined) updateData.weight = clientData.weight;
  if (clientData.gender !== undefined) updateData.gender = clientData.gender;
  if (clientData.bloodGroup !== undefined) updateData.bloodGroup = clientData.bloodGroup;
  if (clientData.bmi !== undefined) updateData.bmi = clientData.bmi;
  if (clientData.aadharNumber !== undefined) updateData.aadharNumber = clientData.aadharNumber;
  // Include photoUrl if it's a non-empty string, or explicitly set to empty string to clear it
  if (clientData.photoUrl !== undefined) {
    if (clientData.photoUrl === '' || (clientData.photoUrl && clientData.photoUrl.trim() !== '')) {
      updateData.photoUrl = clientData.photoUrl.trim() || '';
      console.log('[updateClient] Updating photoUrl:', updateData.photoUrl);
    } else {
      console.log('[updateClient] photoUrl is null, skipping update');
    }
  } else {
    console.log('[updateClient] photoUrl not provided in update data');
  }
  if (clientData.address !== undefined) updateData.address = clientData.address;
  if (clientData.membershipType !== undefined) {
    // Convert membershipId to MongoDB ObjectId if it's a number
    let membershipTypeId = clientData.membershipType;
    if (membershipTypeId) {
      const membershipId = parseInt(membershipTypeId);
      // Validate that it's a reasonable membershipId (should be a small positive integer, not a huge number)
      if (!isNaN(membershipId) && membershipId > 0 && membershipId < 100000) {
        // Find membership by membershipId and get its MongoDB _id
        const membership = await Membership.findOne({ membershipId });
        if (membership) {
          membershipTypeId = membership._id.toString();
        } else {
          throw new Error(`Membership with ID ${membershipId} not found`);
        }
      } else if (membershipTypeId.length === 24) {
        // If it's a 24-character string, it might be a MongoDB ObjectId
        // Try to find membership by MongoDB _id directly
        try {
          const membership = await Membership.findById(membershipTypeId);
          if (membership) {
            membershipTypeId = membership._id.toString();
          } else {
            throw new Error(`Membership not found`);
          }
        } catch (error) {
          throw new Error(`Invalid membership ID format. Please select a valid membership.`);
        }
      } else {
        throw new Error(`Invalid membership ID: ${membershipTypeId}. Please select a valid membership.`);
      }
    }
    updateData.membershipType = membershipTypeId ? membershipTypeId : null;
  }
  if (clientData.joiningDate !== undefined) {
    updateData.joiningDate = clientData.joiningDate ? new Date(clientData.joiningDate) : null;
  }
  if (clientData.expiryDate !== undefined) {
    updateData.expiryDate = clientData.expiryDate ? new Date(clientData.expiryDate) : null;
  }
  if (clientData.membershipFee !== undefined) updateData.membershipFee = clientData.membershipFee;
  if (clientData.discount !== undefined) updateData.discount = clientData.discount;
  if (clientData.paymentDate !== undefined) {
    updateData.paymentDate = clientData.paymentDate ? new Date(clientData.paymentDate) : null;
  }
  if (clientData.paymentMode !== undefined) updateData.paymentMode = clientData.paymentMode;
  if (clientData.transactionId !== undefined) updateData.transactionId = clientData.transactionId;
  if (clientData.paidAmount !== undefined) updateData.paidAmount = clientData.paidAmount;
  if (clientData.emergencyContactName !== undefined) updateData.emergencyContactName = clientData.emergencyContactName;
  if (clientData.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = clientData.emergencyContactPhone;
  if (clientData.medicalConditions !== undefined) updateData.medicalConditions = clientData.medicalConditions;
  if (clientData.fitnessGoals !== undefined) updateData.fitnessGoals = clientData.fitnessGoals;
  if (clientData.firstTimeInGym !== undefined) updateData.firstTimeInGym = clientData.firstTimeInGym;
  if (clientData.previousGymDetails !== undefined) updateData.previousGymDetails = clientData.previousGymDetails;
  
  // Try to find by clientId first (if it's a number), otherwise try MongoDB _id
  const clientId = parseInt(id);
  let client;
  
  if (!isNaN(clientId) && clientId > 0 && clientId < 100000) {
    client = await Client.findOneAndUpdate({ clientId }, updateData, { new: true })
      .populate('membershipType', 'name membershipId')
      .lean();
  } else {
    client = await Client.findByIdAndUpdate(id, updateData, { new: true })
      .populate('membershipType', 'name membershipId')
      .lean();
  }
  
  if (!client) return null;
  return mapToClientType(client);
}

function mapToClientType(client: any): ClientType {
  // Convert membership MongoDB _id to membershipId for frontend
  const membershipType = client.membershipType?.membershipId 
    ? client.membershipType.membershipId.toString() 
    : client.membershipType?._id?.toString() || client.membershipType?.toString() || '';
  
  // Ensure clientId is valid
  const clientId = client.clientId;
  if (!clientId || clientId < 1 || !Number.isInteger(clientId)) {
    console.error(`Error: Client "${client.firstName} ${client.lastName}" (MongoDB _id: ${client._id}) has invalid clientId: ${clientId}. It must be >= 1.`);
    throw new Error(`Client has invalid clientId: ${clientId}. It must be >= 1.`);
  }
  
  return {
    clientId: clientId,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    dateOfBirth: client.dateOfBirth ? client.dateOfBirth.toISOString().split('T')[0] : '',
    age: client.age,
    height: client.height,
    weight: client.weight,
    gender: client.gender,
    bloodGroup: client.bloodGroup,
    bmi: client.bmi,
    aadharNumber: client.aadharNumber,
    photoUrl: client.photoUrl,
    address: client.address,
    membershipType: membershipType, // Now returns membershipId instead of MongoDB _id
    membershipName: client.membershipType?.name || undefined,
    joiningDate: client.joiningDate ? client.joiningDate.toISOString().split('T')[0] : undefined,
    expiryDate: client.expiryDate ? client.expiryDate.toISOString().split('T')[0] : undefined,
    membershipFee: client.membershipFee,
    discount: client.discount,
    paymentDate: client.paymentDate ? client.paymentDate.toISOString().split('T')[0] : undefined,
    paymentMode: client.paymentMode,
    transactionId: client.transactionId,
    paidAmount: client.paidAmount,
    emergencyContactName: client.emergencyContactName,
    emergencyContactPhone: client.emergencyContactPhone,
    medicalConditions: client.medicalConditions,
    fitnessGoals: client.fitnessGoals,
    firstTimeInGym: client.firstTimeInGym,
    previousGymDetails: client.previousGymDetails,
    createdAt: client.createdAt ? client.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: client.updatedAt ? client.updatedAt.toISOString() : undefined,
  };
}
