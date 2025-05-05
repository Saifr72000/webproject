import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import {
  createStudy,
  getStudyById,
  getAllStudies,
} from "../../controllers/study.controller";
import {
  createStudyService,
  getStudyByIdService,
  getAllStudiesService,
} from "../../services/study.service";
import { saveStimulusMetadata } from "../../services/stimuli.service";

// Mock the dependencies
jest.mock("../../services/study.service");
jest.mock("../../services/stimuli.service");

describe("Study Controller Unit Tests", () => {
  // Setup common test variables
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock request, response, and next function
    mockRequest = {
      body: {},
      params: {},
      user: { userId: "test-user-id" },
      file: {
        originalname: "test-image.jpg",
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("test-image-data"),
      } as any, //was getting error when using the file object because it was not present on Request object
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe("createStudy", () => {
    test("should create a study with cover image successfully", async () => {
      // Setup mock request
      mockRequest.body = {
        name: "Test Study",
        description: "Test Description",
      };

      // Mock the saveStimulusMetadata function
      const mockSavedStimulus = {
        _id: new mongoose.Types.ObjectId(),
        url: "",
        save: jest.fn().mockResolvedValue(true),
      };
      (saveStimulusMetadata as jest.Mock).mockResolvedValue(mockSavedStimulus);

      // Mock the createStudyService function
      const mockCreatedStudy = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test Study",
        description: "Test Description",
        owner: "test-user-id",
        coverImage: mockSavedStimulus._id,
      };
      (createStudyService as jest.Mock).mockResolvedValue(mockCreatedStudy);

      // Call the controller function
      await createStudy(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(saveStimulusMetadata).toHaveBeenCalledWith({
        filename: "test-image.jpg",
        mimetype: "image/jpeg",
        size: 1024,
        data: expect.any(Buffer),
      });

      expect(mockSavedStimulus.save).toHaveBeenCalled();

      expect(createStudyService).toHaveBeenCalledWith(
        "Test Study",
        "Test Description",
        "test-user-id",
        mockSavedStimulus._id
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedStudy);
    });

    test("should create a study without cover image", async () => {
      // Setup mock request without file
      mockRequest.body = {
        name: "Test Study",
        description: "Test Description",
      };
      mockRequest.file = undefined;

      // Mock the createStudyService function
      const mockCreatedStudy = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test Study",
        description: "Test Description",
        owner: "test-user-id",
      };
      (createStudyService as jest.Mock).mockResolvedValue(mockCreatedStudy);

      // Call the controller function
      await createStudy(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(saveStimulusMetadata).not.toHaveBeenCalled();

      expect(createStudyService).toHaveBeenCalledWith(
        "Test Study",
        "Test Description",
        "test-user-id",
        undefined
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedStudy);
    });

    test("should handle errors when creating a study", async () => {
      // Setup mock request
      mockRequest.body = {
        name: "Test Study",
        description: "Test Description",
      };

      // Mock service to throw an error
      const errorMessage = "Service error";
      (createStudyService as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      // Call the controller function
      await createStudy(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to create study",
        error: errorMessage,
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("getStudyById", () => {
    test("should retrieve a study by ID successfully", async () => {
      // Setup mock request
      mockRequest.params = { id: "study-id-123" };

      // Mock the getStudyByIdService function
      const mockStudy = {
        _id: "study-id-123",
        name: "Test Study",
        description: "Test Description",
      };
      (getStudyByIdService as jest.Mock).mockResolvedValue(mockStudy);

      // Call the controller function
      await getStudyById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(getStudyByIdService).toHaveBeenCalledWith("study-id-123");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockStudy);
    });

    test("should handle errors when retrieving a study", async () => {
      // Setup mock request
      mockRequest.params = { id: "invalid-id" };

      // Mock service to throw an error
      const errorMessage = "Study not found";
      (getStudyByIdService as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      // Call the controller function
      await getStudyById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to get study by ID",
        error: errorMessage,
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("getAllStudies", () => {
    test("should retrieve all studies successfully", async () => {
      // Mock the getAllStudiesService function
      const mockStudies = [
        {
          _id: "study-id-1",
          name: "Study 1",
          description: "Description 1",
        },
        {
          _id: "study-id-2",
          name: "Study 2",
          description: "Description 2",
        },
      ];
      (getAllStudiesService as jest.Mock).mockResolvedValue(mockStudies);

      // Call the controller function
      await getAllStudies(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(getAllStudiesService).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockStudies);
    });

    test("should handle errors when retrieving all studies", async () => {
      // Mock service to throw an error
      const errorMessage = "Database error";
      (getAllStudiesService as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      // Call the controller function
      await getAllStudies(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Failed to get all studies",
        error: errorMessage,
      });
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
