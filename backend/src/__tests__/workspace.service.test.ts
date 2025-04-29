jest.mock("../models/workspace.model");
jest.mock("../models/user.model"); // Mock the User model to isolate tests from the database

import mongoose from "mongoose";
import { addUserToWorkspace, 
  fetchWorkspaceId, 
  deleteWorkspaceById,
  saveNewWorkspace,
  updateWorkspaceById,
  getWorkspaceForUser
 } from "../services/workspace.service";

import {Workspace} from "../models/workspace.model";
import { User } from "../models/user.model";





const mockedWorkspaceModel = Workspace as jest.Mocked<typeof Workspace>;  // Mock the Workspace model, allowing us to use it in our tests without actually hitting the database
const mockedUserModel = User as jest.Mocked<typeof User>; // Mock the User model, allowing us to use it in our tests without actually hitting the database




describe("fetchWorkspaceId", () => { // Test suite for fetchWorkspaceId function
  const validId = new mongoose.Types.ObjectId().toString(); // Generate a valid ObjectId string for testing

  afterEach(() => { // Clear all mocks after each test to ensure no state is shared between tests
    jest.clearAllMocks(); // Clear all mocks after each test
  }); 

  it("should return a workspace if found", async () => { // Test case for when a workspace is found
    const mockWorkspace = { // Create a mock workspace object
      _id: validId, // Use the validId generated above
      name: "Design Team", // Example name
      owner: new mongoose.Types.ObjectId(), // Example owner ID
    };

    mockedWorkspaceModel.findById.mockResolvedValueOnce(mockWorkspace as any); // Mock the findById method to return the mock workspace

    const result = await fetchWorkspaceId(validId); // Call the function being tested

    expect(result).toEqual(mockWorkspace); // Check that the result matches the mock workspace
    expect(Workspace.findById).toHaveBeenCalledWith(validId); // Ensure findById was called with the correct ID
  });

  

  it("should return null if no workspace is found", async () => { // Test case for when no workspace is found
    mockedWorkspaceModel.findById.mockResolvedValueOnce(null); // Mock findById to return null

    const result = await fetchWorkspaceId(validId); // Call the function being tested

    expect(result).toBeNull(); // Check that the result is null
    expect(Workspace.findById).toHaveBeenCalledWith(validId); // Ensure findById was called with the correct ID
  });
});



describe("deleteWorkspaceById", () => { // Test suite for deleteWorkspaceById function
  const workspaceId = new mongoose.Types.ObjectId().toString(); // Generate a valid ObjectId string for testing
  const ownerId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId string for testing
  const anotherUserId = new mongoose.Types.ObjectId(); // Generate a valid ObjectId string for testing


  afterEach(() => { // Clear all mocks after each test to ensure no state is shared between tests
    jest.clearAllMocks();
  });



  it ("should return null if workspace is not found", async () => {
    mockedWorkspaceModel.findById.mockResolvedValueOnce(null); // Mock findById to return null

    const result = await deleteWorkspaceById(workspaceId, ownerId); // Call the function being tested
    expect(result).toBeNull();
    expect(Workspace.findById).toHaveBeenCalledWith(workspaceId); // Ensure findById was called with the correct ID
  });




  it("should return 'forbidden' if user is not the owner", async () => {
    const mockWorkspace = {
      owner: anotherUserId, // Different owner ID
    };

    mockedWorkspaceModel.findById.mockResolvedValueOnce(mockWorkspace as any); // Mock findById to return the mock workspace

    const result = await deleteWorkspaceById(workspaceId, ownerId); // Call the function being tested
    expect(result).toBe("forbidden"); // Check that the result is "forbidden"
  });






  it("should delete the workspace if user is owner", async () => {
    const deleteOneMock = jest.fn(); // Create a mock for the deleteOne method
    const mockWorkspace = {
      owner: ownerId,
      deleteOne: deleteOneMock, // Use the mock for deleteOne
    };

    mockedWorkspaceModel.findById.mockResolvedValueOnce(mockWorkspace as any); // Mock findById to return the mock workspace

    const result = await deleteWorkspaceById(workspaceId, ownerId); // Call the function being tested

    expect(deleteOneMock).toHaveBeenCalled(); // Check that deleteOne was called
    expect(result).toBe(true); // Check that the result is true
  });
});












describe ("addUserToWorkspace", () => {
    const ownerId = new mongoose.Types.ObjectId();
    const newUserId = new mongoose.Types.ObjectId();
    const workspaceId = new mongoose.Types.ObjectId().toString();

    afterEach(() => {
        jest.clearAllMocks();
      });

      it("should return 'forbidden' if user is not the owner", async () => {
        mockedWorkspaceModel.findById.mockResolvedValueOnce({
          owner: new mongoose.Types.ObjectId(),
          members: [],
        } as any);
    
        const result = await addUserToWorkspace(workspaceId, ownerId, newUserId);
        expect(result).toBe("forbidden");
      });
    
      it("should return 'already-member' if user is already a member", async () => {
        mockedWorkspaceModel.findById.mockResolvedValueOnce({
          owner: ownerId,
          members: [{ user: newUserId }],
        } as any);
    
        const result = await addUserToWorkspace(workspaceId, ownerId, newUserId);
        expect(result).toBe("already-member");
      });
    
      it("should return null if workspace is not found", async () => {
        mockedWorkspaceModel.findById.mockResolvedValueOnce(null);
    
        const result = await addUserToWorkspace(workspaceId, ownerId, newUserId);
        expect(result).toBeNull();
      });
    
      it("should add user and return updated workspace", async () => {
        const saveMock = jest.fn();
    
        mockedWorkspaceModel.findById.mockResolvedValueOnce({
          owner: ownerId,
          members: [],
          save: saveMock,
        } as any);
    
        const result = await addUserToWorkspace(workspaceId, ownerId, newUserId);
    
        expect(saveMock).toHaveBeenCalled();
        expect(result).toHaveProperty("members");
      });
    });






// first my test calls const result = await saveNewWorkspace({ name: "Test Workspace", userId });
// this triggers the saveNewWorkspace function in the workspace.service.ts file

    describe("saveNewWorkspace", () => { // describe is a Jest function that groups related tests together
      // ⬇️ all tests for this service go here
      const userId = new mongoose.Types.ObjectId(); // <-- Generate a fake valid ObjectId (or dummy data) string for testing (for example user.findByIdAndUpdate)
      const workspaceName = "test workspace";
    
      afterEach(() => {
        jest.clearAllMocks();
      });
    
      it("should create and save a new workspace and link it to the user", async () => {
        //Mock the save method on Workspace instances
        const mockSave = jest.fn().mockResolvedValueOnce(true); // This creates a fake .save() function that pretends to succeed, so you can test your service logic without talking to the real database.
        // jest.fn()	Creates a fake/mock function
        // mockResolvedValueOnce(true) Simulates the behavior of a promise that resolves to true when called once.
        const mockWorkspace = {
          _id: new mongoose.Types.ObjectId(),
          name: workspaceName,
          owner: userId,
          members: [{ user: userId, role: "owner" }],
          save: mockSave,
        };
    
        //Replace the Workspace constructor to return our mocked instance
        // where you would normally use new Workspace({ name, owner: userId });
        // Instead of building a real Workspace object, just return the mockWorkspace object
        (mockedWorkspaceModel as any).mockImplementation(() => mockWorkspace);

        //Mock User.findByIdAndUpdate
        mockedUserModel.findByIdAndUpdate.mockResolvedValueOnce({});
        // This is where we are mocking the User model's findByIdAndUpdate method 
        // to simulate the database update operation without actually hitting the database.
        // This is similar to how you would use jest.fn() to create a mock function
        // faking await User.findByIdAndUpdate(...), 
        // pretends it was successful by returning an empty object
        // stimulates success without actually hitting the database
    

        //Call the service
        // This is where we are calling the saveNewWorkspace function with the mocked data
        // The test is calling your real saveNewWorkspace() function, passing in the test data.
        const result = await saveNewWorkspace({ name: workspaceName, userId });
        // this function: calls your mocked Workspace constructor, which returns the mockWorkspace object
        // then calls the save method on that object, which is also mocked to return true.
        // Finally, it calls User.findByIdAndUpdate with the userId and the new workspace ID.


        //Assertions
        expect(mockSave).toHaveBeenCalled(); // checks if the service logic called the save method on the mockWorkspace object
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
          $push: { workspaces: mockWorkspace._id },
        });
        // This checks if the User.findByIdAndUpdate method was called with the correct arguments.(userId and the new workspace ID)

        expect(result).toMatchObject({
          name: workspaceName,
          owner: userId,
          members: [{ user: userId, role: "owner" }],
        });
        // This checks if the result of the saveNewWorkspace function matches the expected structure.
      });
    });


    describe("updateWorkspaceById", () => {
      const workspaceId = new mongoose.Types.ObjectId().toString();
      const ownerId = new mongoose.Types.ObjectId();
      const updatedName = "updated workspace name";

      afterEach(() => {
        jest.clearAllMocks();
      });

      it ("should return 'forbidden' if user is not the owner", async () => {
        mockedWorkspaceModel.findById.mockResolvedValueOnce({ //highjacks the findById method to return another "owner" than the ownerID to make the test fail
          owner: new mongoose.Types.ObjectId(), // Different owner ID
        } as any); // Mock findById to return a workspace with a different owner

        const result = await updateWorkspaceById(workspaceId, ownerId, {
          name: updatedName,}); // Call the function being tested

          expect(result).toBe("forbidden"); // Check that the result is "forbidden"
      });

      it ("should return null if workspace is not found", async () => {
        mockedWorkspaceModel.findById.mockResolvedValueOnce(null); // Mock findById to return null
        const result = await updateWorkspaceById(workspaceId, ownerId, {
          name: updatedName,}); // Call the function being tested
        expect(result).toBeNull(); // Check that the result is null
        expect(Workspace.findById).toHaveBeenCalledWith(workspaceId); // Ensure findById was called with the correct ID
        expect (Workspace.findByIdAndUpdate).not.toHaveBeenCalled(); // Ensure findByIdAndUpdate was not called
        });






      it ("should update the workspace and return the updated workspace", async () => {
        const newName = "Updated Workspace Name"; // Mock new name

        const mockSave = jest.fn().mockResolvedValue(undefined);

        const mockWorkspace = {
          _id: workspaceId,
          owner: ownerId,
          name: "Old Workspace Name",
          members: [],
          save: mockSave,
        };

        mockedWorkspaceModel.findById.mockResolvedValueOnce(mockWorkspace as any); // Mock findById to return the existing workspace

        const result = await updateWorkspaceById(workspaceId, ownerId, { name: newName }); // Call the function being tested and pass the new name
        
        expect(mockedWorkspaceModel.findById).toHaveBeenCalledWith(workspaceId);
        expect(mockSave).toHaveBeenCalled();
        expect(result).toEqual({
          ...mockWorkspace,
          name: newName,

      });
      });
    });

    describe ("getWorkspaceForUser", () => {
      const userId = new mongoose.Types.ObjectId();
      const mockWorkspaces = [
        { _id: new mongoose.Types.ObjectId(), name: "Workspace 1" },
        { _id: new mongoose.Types.ObjectId(), name: "Workspace 2" },
      ];

      afterEach(() => {
        jest.clearAllMocks();
      });

      it ("should return all workspaces for a user", async () => {
        mockedWorkspaceModel.find.mockResolvedValueOnce(mockWorkspaces as any); // Mock find to return the mock workspaces

        const result = await getWorkspaceForUser(userId); // Call the function being tested
        expect(result).toEqual(mockWorkspaces);
        expect(Workspace.find).toHaveBeenCalledWith({
          "members.user": userId,
        });
      })
    });
