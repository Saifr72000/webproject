jest.mock("../models/workspace.model");
jest.mock("../models/user.model"); // Mock the User model to isolate tests from the database
jest.mock("../services/workspace.service"); // Mock the workspace service to isolate tests from the database

import mongoose from "mongoose";
import {Request, Response} from "express";
import { createWorkspace,
    getUserWorkspaces,
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace,
    addUserToWorkspaceController
    } from "../controllers/workspace.controller";

    import {
        saveNewWorkspace,
        getWorkspaceForUser,
        fetchWorkspaceId,
        updateWorkspaceById,
        deleteWorkspaceById,
        addUserToWorkspace
      } from "../services/workspace.service";

  
  // controller tests

  describe("createWorkspace", () => {

     const validId = new mongoose.Types.ObjectId().toString(); // Generate a valid ObjectId string for testing

      const mockReq = {
        body: { name: "Test Workspace" }, // Mock request object with body containing workspace name
        user: { userId: new mongoose.Types.ObjectId().toString() }, // Mock user object with valid userId
      } as any; // Type-cast to any to bypass strict typing
      const mockRes = {
        status: jest.fn().mockReturnThis(), // returns the mock response object for chaining so that you can call .json() on it like (mockRes.status(201).json({ message: "OK" });)
        json: jest.fn(), // Mock response object
      } as any; // Type-cast to any to bypass strict typing

      // mock the return value of the saveNewWorkspace function
      const mockedWorkspace = {
        _id: "workspace123",
        name: "Test Workspace",
        owner: mockReq.user.userId,
      };
      (saveNewWorkspace as jest.Mock).mockResolvedValue(mockedWorkspace); // Mock the saveNewWorkspace function to return the mocked workspace

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("should create a new workspace and return 201", async () => {
        await createWorkspace(mockReq, mockRes as any); // call the controller function for testing
        expect(mockRes.status).toHaveBeenCalledWith(201); // Check that the response status is 201
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Workspace created successfully",
          workspace: mockedWorkspace, // Check that the response contains the created workspace
        });
      });



        it("should return 401 and 'Invalid or missing user ID'", async () => {
        const badReq = {
            body: { name: "Test Workspace" }, // Mock request object with body containing workspace name
            user: {}, // Mock user object with valid userId
          } as any;

          await createWorkspace(badReq, mockRes);

          expect(mockRes.status).toHaveBeenCalledWith(401);
          expect(mockRes.json).toHaveBeenCalledWith({
            message: "Invalid or missing user ID."
          });

        });

          it("should return 500 if saveWorkspace does not work", async () => {
            const mockReq = {
                body: { name: "Test Workspace" },
                user: {userId: validId}, 
            } as any;

            (saveNewWorkspace as jest.Mock).mockRejectedValue(new Error("Database Error"));

            await createWorkspace(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({message: "Internal server error"})
          });
    });





    describe ("getUserWorkspaces", () => {
        const userId = new mongoose.Types.ObjectId().toString();

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as Partial<Response>;

        const mockReq = {
            user: {userId},
        } as Partial<Request>; // mocking what i need for the test, therefore "partial".

        afterEach(() => {
            jest.clearAllMocks();
          });

          it("should return 200 and a list of workspaces", async () => {
          const testWorkspaces = [
            {_id: "1", name: "test-workspace 1", owner: userId},
            {_id: "2", name: "test-workspace 2", owner: userId}
          ];

          (getWorkspaceForUser as jest.Mock).mockResolvedValue(testWorkspaces);

          await getUserWorkspaces(mockReq as Request, mockRes as Response);

          expect(getWorkspaceForUser).toHaveBeenCalledWith(userId);
          expect(mockRes.status).toHaveBeenCalledWith(200);
          expect(mockRes.json).toHaveBeenCalledWith(testWorkspaces);
          });

          it("should return 401 'Unauthorized' if userId is not the owner", async () => {
            const badReq= {} as Request

            await getUserWorkspaces(badReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({message: "Unauthorized"});
          });

          it("should return 500 if getWorkspaceForUser doesn't work", async () => {

            const mockReq = {
                user: { userId },
              } as any;
            
            (getWorkspaceForUser as jest.Mock).mockRejectedValue(new Error("Database Error"));

            await getUserWorkspaces(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({message: "Internal server error"});
          });
    });

    describe ("getWorkspaceById", () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const workspaceId = new mongoose.Types.ObjectId().toString();

        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as Partial<Response>;

        const mockReq = {
            user: {userId},
            params: { id: workspaceId },
        } as Partial<Request>; 



          afterEach (() =>{
            jest.clearAllMocks();
          });

          it ("should return 200 and workspace by Id", async () => {
            const mockedWorkspace = {
            _id: workspaceId,
            name: "Test Workspace",
            owner: mockReq.user.userId,
            members: [{ user: userId, role: "owner" }],
          };

          (fetchWorkspaceId as jest.Mock).mockResolvedValue(mockedWorkspace);

          await getWorkspaceById(mockReq as Request, mockRes as Response);

          expect (mockRes.status).toHaveBeenCalledWith(200);
          expect (mockRes.json).toHaveBeenCalledWith(
            {workspace: mockedWorkspace,
            });
          });



          it("should return 404 if workspace is not found", async () => {

            (fetchWorkspaceId as jest.Mock).mockResolvedValue(null);

            await getWorkspaceById(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
              message: "Workspace not found",
            });
    });

    it("should return 500 if internal server error", async () => {

        (fetchWorkspaceId as jest.Mock).mockRejectedValue(new Error("Database Error"))

        await getWorkspaceById(mockReq as Request, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
            message: "Internal server error"
        });
    })
});

describe ("updateWorkspace", () => {

    const userId = new mongoose.Types.ObjectId().toString();
    const workspaceId = new mongoose.Types.ObjectId().toString();
    const updatedName = "new-name";

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;


    const mockReq = {
        params: {id: workspaceId},
        user: {userId},
        body: {name: updatedName},
    }  as unknown as Request;

    const mockedWorkspace = {
        _id: userId,
        name: updatedName,
        ownerId: userId,
        members: [{user: userId, role: "owner"}]
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 and updatedWorkspace name", async () => {

        (updateWorkspaceById as jest.Mock).mockResolvedValue(mockedWorkspace);

        await updateWorkspace(mockReq, mockRes);
        
      expect(updateWorkspaceById).toHaveBeenCalledWith(workspaceId, userId, { name: updatedName });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({message: "Workspace updated",
        workspace: mockedWorkspace,

      });
    });


    it("should return 401 if userId is missing", async () => {
        const req = {
          params: { id: workspaceId },
          body: { name: updatedName },
          user: null,
        } as unknown as Request;
      
        await updateWorkspace(req, mockRes);
      
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      });
   

      it("should return 400 if workspaceId is invalid", async () => {
        const req = {
          params: { id: "non-valid-object-id123" },
          user: { userId },
          body: { name: updatedName },
        } as unknown as Request;
      
        await updateWorkspace(req, mockRes);
      
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid workspace ID" });
      });


      it("should return 403 if user is not the owner", async () => {
        (updateWorkspaceById as jest.Mock).mockResolvedValue("forbidden");
      
        await updateWorkspace(mockReq, mockRes);
      
        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Only the owner can update this workspace",
        });
      });

      it("should return 404 if workspace is not found", async () => {
        (updateWorkspaceById as jest.Mock).mockResolvedValue(null);
      
        await updateWorkspace(mockReq, mockRes);
      
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Workspace not found",
        });
      });

      
      it("should return 500 if updateWorkspaceById throws an internal server error", async () => {
        (updateWorkspaceById as jest.Mock).mockRejectedValue(new Error("Something went wrong"));
      
        await updateWorkspace(mockReq, mockRes);
      
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({
          message: "Internal server error",
        });
      });
});





describe("deleteWorkspace", () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const workspaceId = new mongoose.Types.ObjectId().toString();

  const mockReq = {
    params: { id: workspaceId },
    user: { userId },
  } as unknown as Request;

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no user is provided", async () => {
    const badReq = {
      params: { id: workspaceId },
    } as unknown as Request;

    await deleteWorkspace(badReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });


  it("should return 200 if workspace is deleted successfully", async () => {
    (deleteWorkspaceById as jest.Mock).mockResolvedValue(true);

    await deleteWorkspace(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "workspace deleted successfully" });
  });


  it("should return 400 for invalid workspace Id", async () => {
    const badReq = {
      params: { id: "wrong-id" },
      user: { userId },
    } as unknown as Request;

    await deleteWorkspace(badReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid Workspace ID" });
  });



  it("should return 403 if user is not the owner", async () => {
    (deleteWorkspaceById as jest.Mock).mockResolvedValue("forbidden");

    await deleteWorkspace(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "only owner can delete this workspace" });
  });

  it("should return 404 if workspace is not found", async () => {
    (deleteWorkspaceById as jest.Mock).mockResolvedValue(null);

    await deleteWorkspace(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "workspace not found" });
  });


  it("should return 500 if an internal error occurs", async () => {
    (deleteWorkspaceById as jest.Mock).mockRejectedValue(new Error("database error"));

    await deleteWorkspace(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "internal sever error" });
  });
});














describe("addUserToWorkspaceController", () => {
    const workspaceId = new mongoose.Types.ObjectId().toString();
    const ownerId = new mongoose.Types.ObjectId().toString();
    const newUserId = new mongoose.Types.ObjectId().toString();
  
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockReq = {
        params: { id: workspaceId },
        user: { userId: ownerId },
        body: { userId: newUserId },
      } as unknown as Request;
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it("should return 400 if userId or ownerId is missing", async () => {
      const req = {
        params: { id: workspaceId },
        user: {},
        body: {},
      } as unknown as Request;
  
      await addUserToWorkspaceController(req, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Missing user ID" });
    });
  
    it("should return 400 if ID format is invalid", async () => {
      const req = {
        params: { id: "bad-id" },
        user: { userId: "wrong-object-id" },
        body: { userId: "another-wrong-id" },
      } as unknown as Request;
  
      await addUserToWorkspaceController(req, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Invalid ID format" });
    });
  

    it("should return 403 if user is not the owner", async () => {

  
      (addUserToWorkspace as jest.Mock).mockResolvedValue("forbidden");
  
      await addUserToWorkspaceController(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Only the owner can add users" });
    });
  
    it("should return 409 if user is already a member", async () => {

  
      (addUserToWorkspace as jest.Mock).mockResolvedValue("already-member");
  
      await addUserToWorkspaceController(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "User is already a member" });
    });
  
    it("should return 404 if workspace not found", async () => {

      (addUserToWorkspace as jest.Mock).mockResolvedValue(null);
  
      await addUserToWorkspaceController(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Workspace not found" });
    });
  
    it("should return 200 and updated workspace if successful", async () => {
      const updatedWorkspace = {
        _id: workspaceId,
        name: "test member",
        members: [{ user: ownerId, role: "owner" }, { user: newUserId, role: "member" }],
      };
  
      (addUserToWorkspace as jest.Mock).mockResolvedValue(updatedWorkspace);
  
      await addUserToWorkspaceController(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "User added to workspace",
        workspace: updatedWorkspace,
      });
    });
  
    it("should return 500 on internal error", async () => {

      (addUserToWorkspace as jest.Mock).mockRejectedValue(new Error("Something went wrong"));
  
      await addUserToWorkspaceController(mockReq, mockRes);
  
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Internal server error" });
    });
  });