import React, { useState } from "react";
import "./DemographicsForm.css";

const DemographicsForm = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    gender: "",
    ageGroup: "",
    educationLevel: "",
    aiFamiliarity: 4, // Default value for the slider
    deviceType: "Desktop", // Default value for device type
  });

  const [errors, setErrors] = useState({
    gender: "",
    ageGroup: "",
    educationLevel: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user makes a selection
    if (value) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSliderChange = (e) => {
    setFormData({
      ...formData,
      aiFamiliarity: parseInt(e.target.value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset all errors
    const newErrors = {
      gender: "",
      ageGroup: "",
      educationLevel: "",
    };

    // Check each field
    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }

    if (!formData.ageGroup) {
      newErrors.ageGroup = "Please select an age group";
    }

    if (!formData.educationLevel) {
      newErrors.educationLevel = "Please select an education level";
    }

    setErrors(newErrors);

    // Only submit if no errors
    if (!newErrors.gender && !newErrors.ageGroup && !newErrors.educationLevel) {
      onSubmit(formData);
    }
  };

  return (
    <div className="demographics-form-container">
      <h1>One Last Step</h1>

      <p className="demographics-intro">
        Please provide some anonymous information about yourself:
      </p>

      <div className="info-box">
        <p>
          This information helps researchers understand the study results
          better. Your data will be kept anonymous.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          {errors.gender && <p className="simple-error">{errors.gender}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="ageGroup">Age Group</label>
          <select
            id="ageGroup"
            name="ageGroup"
            value={formData.ageGroup}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Age Group
            </option>
            <option value="under-18">Under 18</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55-64">55-64</option>
            <option value="65+">65+</option>
          </select>
          {errors.ageGroup && <p className="simple-error">{errors.ageGroup}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="educationLevel">Level of Education</label>
          <select
            id="educationLevel"
            name="educationLevel"
            value={formData.educationLevel}
            onChange={handleChange}
          >
            <option value="" disabled>
              Select Education Level
            </option>
            <option value="high-school">High school diploma</option>
            <option value="bachelors">Bachelors degree</option>
            <option value="masters">Masters degree</option>
            <option value="phd">PhD</option>
          </select>
          {errors.educationLevel && (
            <p className="simple-error">{errors.educationLevel}</p>
          )}
        </div>

        {/* <div className="form-group">
          <label htmlFor="aiFamiliarity">
            AI Familiarity (1 = Not familiar, 7 = Very familiar)
          </label>
          <div className="slider-container">
            <input
              type="range"
              id="aiFamiliarity"
              name="aiFamiliarity"
              min="1"
              max="7"
              value={formData.aiFamiliarity}
              onChange={handleSliderChange}
            />
            <div className="slider-value">{formData.aiFamiliarity}</div>
          </div>
        </div> */}

        <div className="form-group">
          <label htmlFor="deviceType">Device Type</label>
          <select
            id="deviceType"
            name="deviceType"
            value={formData.deviceType}
            onChange={handleChange}
          >
            <option value="Desktop">Desktop</option>
            <option value="Tablet">Tablet</option>
            <option value="Mobile">Mobile</option>
          </select>
        </div>

        <div className="button-group">
          <button type="button" className="back-button" onClick={onBack}>
            Back to Questions
          </button>
          <button type="submit" className="submit-button">
            Submit & View Results
          </button>
        </div>
      </form>
    </div>
  );
};

export default DemographicsForm;
