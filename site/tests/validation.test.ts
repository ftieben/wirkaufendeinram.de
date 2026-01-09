import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateRAMSpecification, isValidRAMSpecification, validateSellerContact, isValidSellerContact } from '../src/lib/validation';

/**
 * Feature: ram-buying-site, Property 1: RAM specification validation
 * Validates: Requirements 1.2
 */

describe('RAM Specification Validation Properties', () => {
  // Valid values for generating test data
  const validRAMTypes = ['DDR3', 'DDR4', 'DDR5'] as const;
  const validCapacities = [1, 2, 4, 8, 16, 32, 64, 128];
  const validBrands = [
    'Corsair', 'G.Skill', 'Kingston', 'Crucial', 'Samsung', 'SK Hynix', 
    'Micron', 'ADATA', 'Team', 'Patriot', 'HyperX', 'Mushkin', 'GeIL'
  ];
  const validConditions = ['new', 'excellent', 'good', 'fair'] as const;
  
  // Speed ranges for each RAM type
  const speedRanges = {
    DDR3: { min: 800, max: 2133 },
    DDR4: { min: 1600, max: 3200 },
    DDR5: { min: 3200, max: 6400 }
  };

  // Generator for valid RAM specifications
  const validRAMSpecArb = fc.record({
    type: fc.constantFrom(...validRAMTypes),
    capacity: fc.constantFrom(...validCapacities),
    speed: fc.integer({ min: 800, max: 6400 }),
    brand: fc.constantFrom(...validBrands),
    condition: fc.constantFrom(...validConditions),
    quantity: fc.integer({ min: 1, max: 100 })
  }).filter(spec => {
    // Ensure speed is valid for the RAM type
    const range = speedRanges[spec.type];
    return spec.speed >= range.min && spec.speed <= range.max;
  });

  // Generator for invalid RAM specifications (missing required fields)
  const invalidRAMSpecArb = fc.oneof(
    // Missing type
    fc.record({
      capacity: fc.constantFrom(...validCapacities),
      speed: fc.integer({ min: 800, max: 6400 }),
      brand: fc.constantFrom(...validBrands),
      condition: fc.constantFrom(...validConditions),
      quantity: fc.integer({ min: 1, max: 100 })
    }),
    // Missing capacity
    fc.record({
      type: fc.constantFrom(...validRAMTypes),
      speed: fc.integer({ min: 800, max: 6400 }),
      brand: fc.constantFrom(...validBrands),
      condition: fc.constantFrom(...validConditions),
      quantity: fc.integer({ min: 1, max: 100 })
    }),
    // Missing speed
    fc.record({
      type: fc.constantFrom(...validRAMTypes),
      capacity: fc.constantFrom(...validCapacities),
      brand: fc.constantFrom(...validBrands),
      condition: fc.constantFrom(...validConditions),
      quantity: fc.integer({ min: 1, max: 100 })
    }),
    // Missing brand
    fc.record({
      type: fc.constantFrom(...validRAMTypes),
      capacity: fc.constantFrom(...validCapacities),
      speed: fc.integer({ min: 800, max: 6400 }),
      condition: fc.constantFrom(...validConditions),
      quantity: fc.integer({ min: 1, max: 100 })
    }),
    // Missing condition
    fc.record({
      type: fc.constantFrom(...validRAMTypes),
      capacity: fc.constantFrom(...validCapacities),
      speed: fc.integer({ min: 800, max: 6400 }),
      brand: fc.constantFrom(...validBrands),
      quantity: fc.integer({ min: 1, max: 100 })
    }),
    // Missing quantity
    fc.record({
      type: fc.constantFrom(...validRAMTypes),
      capacity: fc.constantFrom(...validCapacities),
      speed: fc.integer({ min: 800, max: 6400 }),
      brand: fc.constantFrom(...validBrands),
      condition: fc.constantFrom(...validConditions)
    }),
    // Invalid values - using any to bypass TypeScript checking for test purposes
    fc.record({
      type: fc.string().filter(s => !validRAMTypes.includes(s as any)),
      capacity: fc.oneof(
        fc.integer({ max: 0 }), // negative or zero
        fc.integer({ min: 129 }), // too large
        fc.integer().filter(n => !validCapacities.includes(n) && n > 0 && n < 129) // not in valid list
      ),
      speed: fc.oneof(
        fc.integer({ max: 0 }), // negative or zero
        fc.integer({ min: 10000 }) // unrealistically high
      ),
      brand: fc.oneof(
        fc.string().filter(s => !validBrands.includes(s) && s.trim().length > 0),
        fc.constant(''), // empty string
        fc.constant('   ') // whitespace only
      ),
      condition: fc.string().filter(s => !validConditions.includes(s as any)),
      quantity: fc.oneof(
        fc.integer({ max: 0 }), // negative or zero
        fc.integer({ min: 101 }) // too large
      )
    }).map(spec => spec as any) // Cast to any to bypass TypeScript checking
  );

  it('Property 1: RAM specification validation - for any valid RAM specification, the Price_Calculator should correctly validate it against known RAM standards, accepting valid specifications and rejecting invalid ones with appropriate error messages', () => {
    fc.assert(
      fc.property(
        validRAMSpecArb,
        (validSpec) => {
          const result = validateRAMSpecification(validSpec);
          
          // Valid specifications should pass validation
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
          
          // The type guard should also return true
          expect(isValidRAMSpecification(validSpec)).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1b: RAM specification validation - for any invalid RAM specification, the Price_Calculator should reject it with appropriate error messages', () => {
    fc.assert(
      fc.property(
        invalidRAMSpecArb,
        (invalidSpec) => {
          const result = validateRAMSpecification(invalidSpec);
          
          // Invalid specifications should fail validation
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          
          // Each error should have a field and message
          result.errors.forEach(error => {
            expect(error.field).toBeDefined();
            expect(typeof error.field).toBe('string');
            expect(error.field.length).toBeGreaterThan(0);
            
            expect(error.message).toBeDefined();
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
          });
          
          // The type guard should also return false
          expect(isValidRAMSpecification(invalidSpec)).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1c: RAM specification validation - speed validation should respect RAM type constraints', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...validRAMTypes),
        fc.integer({ min: 1, max: 10000 }),
        (ramType, speed) => {
          const spec = {
            type: ramType,
            capacity: 8,
            speed: speed,
            brand: 'Corsair',
            condition: 'new' as const,
            quantity: 1
          };
          
          const result = validateRAMSpecification(spec);
          const range = speedRanges[ramType];
          const isSpeedValid = speed >= range.min && speed <= range.max;
          
          if (isSpeedValid) {
            // If speed is in valid range, validation should pass (assuming other fields are valid)
            expect(result.isValid).toBe(true);
          } else {
            // If speed is out of range, validation should fail with speed error
            expect(result.isValid).toBe(false);
            const speedError = result.errors.find(error => error.field === 'speed');
            expect(speedError).toBeDefined();
            expect(speedError?.message).toContain(ramType);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ram-buying-site, Property 4: Invalid input rejection
 * Validates: Requirements 1.5
 */

describe('Form Invalid Input Rejection Properties', () => {
  // Mock DOM elements for form testing
  const createMockForm = () => {
    const mockForm = {
      elements: new Map<string, { value: string; classList: Set<string> }>(),
      errors: new Map<string, string>(),
      
      // Simulate getting form data
      getFormData() {
        const ramSpec: any = {};
        const contact: any = {};
        
        // RAM specification fields
        const typeValue = this.elements.get('type')?.value;
        if (typeValue) ramSpec.type = typeValue;
        
        const capacityValue = this.elements.get('capacity')?.value;
        if (capacityValue) ramSpec.capacity = parseInt(capacityValue, 10);
        
        const speedValue = this.elements.get('speed')?.value;
        if (speedValue) ramSpec.speed = parseInt(speedValue, 10);
        
        const brandValue = this.elements.get('brand')?.value;
        if (brandValue) ramSpec.brand = brandValue;
        
        const conditionValue = this.elements.get('condition')?.value;
        if (conditionValue) ramSpec.condition = conditionValue;
        
        const quantityValue = this.elements.get('quantity')?.value;
        if (quantityValue) ramSpec.quantity = parseInt(quantityValue, 10);
        
        // Contact fields
        const nameValue = this.elements.get('name')?.value;
        if (nameValue) contact.name = nameValue;
        
        const emailValue = this.elements.get('email')?.value;
        if (emailValue) contact.email = emailValue;
        
        const phoneValue = this.elements.get('phone')?.value;
        if (phoneValue) contact.phone = phoneValue;
        
        const preferredContactValue = this.elements.get('preferredContact')?.value;
        if (preferredContactValue) contact.preferredContact = preferredContactValue;
        
        const locationValue = this.elements.get('location')?.value;
        if (locationValue) contact.location = locationValue;
        
        return { ramSpec, contact };
      },
      
      // Simulate form validation and error highlighting
      validateAndHighlightErrors() {
        const { ramSpec, contact } = this.getFormData();
        
        // Clear previous errors
        this.errors.clear();
        this.elements.forEach(element => {
          element.classList.delete('error');
        });
        
        // Validate RAM specification
        const ramValidation = validateRAMSpecification(ramSpec);
        ramValidation.errors.forEach(error => {
          // Ensure the field element exists
          if (!this.elements.has(error.field)) {
            this.elements.set(error.field, { value: '', classList: new Set() });
          }
          const element = this.elements.get(error.field)!;
          element.classList.add('error');
          this.errors.set(error.field, error.message);
        });
        
        // Validate contact information
        const contactValidation = validateSellerContact(contact);
        contactValidation.errors.forEach(error => {
          // Ensure the field element exists
          if (!this.elements.has(error.field)) {
            this.elements.set(error.field, { value: '', classList: new Set() });
          }
          const element = this.elements.get(error.field)!;
          element.classList.add('error');
          this.errors.set(error.field, error.message);
        });
        
        // Return whether form is valid (no errors)
        return ramValidation.isValid && contactValidation.isValid;
      },
      
      // Set field value
      setField(name: string, value: string) {
        if (!this.elements.has(name)) {
          this.elements.set(name, { value: '', classList: new Set() });
        }
        this.elements.get(name)!.value = value;
      },
      
      // Check if field has error class
      hasFieldError(name: string): boolean {
        return this.elements.get(name)?.classList.has('error') || false;
      },
      
      // Get error message for field
      getFieldError(name: string): string | undefined {
        return this.errors.get(name);
      }
    };
    
    return mockForm;
  };

  // Generator for incomplete RAM specifications (missing required fields)
  const incompleteRAMSpecArb = fc.oneof(
    // Missing type
    fc.record({
      capacity: fc.constantFrom(1, 2, 4, 8, 16, 32, 64, 128).map(String),
      speed: fc.integer({ min: 800, max: 6400 }).map(String),
      brand: fc.constantFrom('Corsair', 'G.Skill', 'Kingston'),
      condition: fc.constantFrom('new', 'excellent', 'good', 'fair'),
      quantity: fc.integer({ min: 1, max: 100 }).map(String)
    }),
    // Missing capacity
    fc.record({
      type: fc.constantFrom('DDR3', 'DDR4', 'DDR5'),
      speed: fc.integer({ min: 800, max: 6400 }).map(String),
      brand: fc.constantFrom('Corsair', 'G.Skill', 'Kingston'),
      condition: fc.constantFrom('new', 'excellent', 'good', 'fair'),
      quantity: fc.integer({ min: 1, max: 100 }).map(String)
    }),
    // Missing speed
    fc.record({
      type: fc.constantFrom('DDR3', 'DDR4', 'DDR5'),
      capacity: fc.constantFrom(1, 2, 4, 8, 16, 32, 64, 128).map(String),
      brand: fc.constantFrom('Corsair', 'G.Skill', 'Kingston'),
      condition: fc.constantFrom('new', 'excellent', 'good', 'fair'),
      quantity: fc.integer({ min: 1, max: 100 }).map(String)
    }),
    // Invalid values
    fc.record({
      type: fc.constant('InvalidType'),
      capacity: fc.constant('999'),
      speed: fc.constant('99999'),
      brand: fc.constant('UnknownBrand'),
      condition: fc.constant('broken'),
      quantity: fc.constant('0')
    })
  );

  // Generator for incomplete contact information
  const incompleteContactArb = fc.oneof(
    // Missing name
    fc.record({
      email: fc.emailAddress(),
      phone: fc.constant('(555) 123-4567'),
      preferredContact: fc.constantFrom('email', 'phone', 'either'),
      location: fc.constant('New York, NY')
    }),
    // Missing email
    fc.record({
      name: fc.constant('John Doe'),
      phone: fc.constant('(555) 123-4567'),
      preferredContact: fc.constantFrom('email', 'phone', 'either'),
      location: fc.constant('New York, NY')
    }),
    // Invalid email
    fc.record({
      name: fc.constant('John Doe'),
      email: fc.constant('invalid-email'),
      phone: fc.constant('(555) 123-4567'),
      preferredContact: fc.constantFrom('email', 'phone', 'either'),
      location: fc.constant('New York, NY')
    }),
    // Invalid phone
    fc.record({
      name: fc.constant('John Doe'),
      email: fc.emailAddress(),
      phone: fc.constant('123'),
      preferredContact: fc.constantFrom('email', 'phone', 'either'),
      location: fc.constant('New York, NY')
    })
  );

  it('Property 4: Invalid input rejection - for any incomplete or invalid RAM specification, the Evaluation_Form should highlight missing/invalid fields and prevent form submission', () => {
    fc.assert(
      fc.property(
        incompleteRAMSpecArb,
        (incompleteSpec) => {
          const mockForm = createMockForm();
          
          // Set the incomplete/invalid form data
          Object.entries(incompleteSpec).forEach(([key, value]) => {
            mockForm.setField(key, value as string);
          });
          
          // Add valid contact information so we're only testing RAM spec validation
          mockForm.setField('name', 'John Doe');
          mockForm.setField('email', 'john@example.com');
          mockForm.setField('phone', '(555) 123-4567');
          mockForm.setField('preferredContact', 'email');
          mockForm.setField('location', 'New York, NY');
          
          // Attempt to validate the form
          const isValid = mockForm.validateAndHighlightErrors();
          
          // Form should be invalid due to incomplete/invalid RAM specification
          expect(isValid).toBe(false);
          
          // At least one field should be highlighted with an error
          const hasAnyError = ['type', 'capacity', 'speed', 'brand', 'condition', 'quantity']
            .some(field => mockForm.hasFieldError(field));
          expect(hasAnyError).toBe(true);
          
          // Each highlighted field should have an error message
          ['type', 'capacity', 'speed', 'brand', 'condition', 'quantity'].forEach(field => {
            if (mockForm.hasFieldError(field)) {
              const errorMessage = mockForm.getFieldError(field);
              expect(errorMessage).toBeDefined();
              expect(typeof errorMessage).toBe('string');
              expect(errorMessage!.length).toBeGreaterThan(0);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4b: Invalid input rejection - for any incomplete or invalid contact information, the Evaluation_Form should highlight missing/invalid fields and prevent form submission', () => {
    fc.assert(
      fc.property(
        incompleteContactArb,
        (incompleteContact) => {
          const mockForm = createMockForm();
          
          // Set valid RAM specification
          mockForm.setField('type', 'DDR4');
          mockForm.setField('capacity', '16');
          mockForm.setField('speed', '3200');
          mockForm.setField('brand', 'Corsair');
          mockForm.setField('condition', 'new');
          mockForm.setField('quantity', '2');
          
          // Set the incomplete/invalid contact data
          Object.entries(incompleteContact).forEach(([key, value]) => {
            mockForm.setField(key, value as string);
          });
          
          // Attempt to validate the form
          const isValid = mockForm.validateAndHighlightErrors();
          
          // Form should be invalid due to incomplete/invalid contact information
          expect(isValid).toBe(false);
          
          // At least one contact field should be highlighted with an error
          const hasAnyError = ['name', 'email', 'phone', 'preferredContact', 'location']
            .some(field => mockForm.hasFieldError(field));
          expect(hasAnyError).toBe(true);
          
          // Each highlighted field should have an error message
          ['name', 'email', 'phone', 'preferredContact', 'location'].forEach(field => {
            if (mockForm.hasFieldError(field)) {
              const errorMessage = mockForm.getFieldError(field);
              expect(errorMessage).toBeDefined();
              expect(typeof errorMessage).toBe('string');
              expect(errorMessage!.length).toBeGreaterThan(0);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ram-buying-site, Property 5: Form interaction feedback
 * Validates: Requirements 3.3
 */

describe('Form Interaction Feedback Properties', () => {
  // Mock DOM elements for form interaction testing
  const createMockFormWithFeedback = () => {
    const mockForm = {
      elements: new Map<string, { 
        value: string; 
        classList: Set<string>; 
        focused: boolean;
        interacted: boolean;
      }>(),
      errors: new Map<string, string>(),
      feedbackMessages: new Map<string, string>(),
      
      // Simulate field interaction (focus, blur, input)
      interactWithField(fieldName: string, action: 'focus' | 'blur' | 'input', newValue?: string) {
        if (!this.elements.has(fieldName)) {
          this.elements.set(fieldName, { 
            value: '', 
            classList: new Set(), 
            focused: false, 
            interacted: false 
          });
        }
        
        const element = this.elements.get(fieldName)!;
        
        switch (action) {
          case 'focus':
            element.focused = true;
            element.interacted = true;
            // Clear error styling on focus (immediate feedback)
            element.classList.delete('error');
            this.errors.delete(fieldName);
            break;
            
          case 'blur':
            element.focused = false;
            // Trigger validation on blur (immediate feedback)
            this.validateSingleField(fieldName);
            break;
            
          case 'input':
            if (newValue !== undefined) {
              element.value = newValue;
            }
            element.interacted = true;
            // Clear errors on input (immediate feedback)
            element.classList.delete('error');
            this.errors.delete(fieldName);
            break;
        }
      },
      
      // Validate a single field and provide immediate feedback
      validateSingleField(fieldName: string) {
        const element = this.elements.get(fieldName);
        if (!element) return;
        
        // Get current form data for validation context
        const formData = this.getFormData();
        
        // Validate based on field type
        if (['type', 'capacity', 'speed', 'brand', 'condition', 'quantity'].includes(fieldName)) {
          const ramValidation = validateRAMSpecification(formData.ramSpec);
          const fieldError = ramValidation.errors.find(error => error.field === fieldName);
          if (fieldError) {
            this.showFieldFeedback(fieldName, fieldError.message, 'error');
          } else if (element.interacted && element.value) {
            this.showFieldFeedback(fieldName, 'Valid', 'success');
          }
        } else if (['name', 'email', 'phone', 'preferredContact', 'location'].includes(fieldName)) {
          const contactValidation = validateSellerContact(formData.contact);
          const fieldError = contactValidation.errors.find(error => error.field === fieldName);
          if (fieldError) {
            this.showFieldFeedback(fieldName, fieldError.message, 'error');
          } else if (element.interacted && element.value) {
            this.showFieldFeedback(fieldName, 'Valid', 'success');
          }
        }
      },
      
      // Show immediate feedback for a field
      showFieldFeedback(fieldName: string, message: string, type: 'error' | 'success' | 'info') {
        const element = this.elements.get(fieldName);
        if (!element) return;
        
        // Update visual feedback (using Set methods since classList is a Set)
        element.classList.delete('error');
        element.classList.delete('success');
        element.classList.delete('info');
        element.classList.add(type);
        
        // Store feedback message
        this.feedbackMessages.set(fieldName, message);
        
        if (type === 'error') {
          this.errors.set(fieldName, message);
        } else {
          this.errors.delete(fieldName);
        }
      },
      
      // Get form data for validation
      getFormData() {
        const ramSpec: any = {};
        const contact: any = {};
        
        // RAM specification fields
        const typeValue = this.elements.get('type')?.value;
        if (typeValue) ramSpec.type = typeValue;
        
        const capacityValue = this.elements.get('capacity')?.value;
        if (capacityValue) ramSpec.capacity = parseInt(capacityValue, 10);
        
        const speedValue = this.elements.get('speed')?.value;
        if (speedValue) ramSpec.speed = parseInt(speedValue, 10);
        
        const brandValue = this.elements.get('brand')?.value;
        if (brandValue) ramSpec.brand = brandValue;
        
        const conditionValue = this.elements.get('condition')?.value;
        if (conditionValue) ramSpec.condition = conditionValue;
        
        const quantityValue = this.elements.get('quantity')?.value;
        if (quantityValue) ramSpec.quantity = parseInt(quantityValue, 10);
        
        // Contact fields
        const nameValue = this.elements.get('name')?.value;
        if (nameValue) contact.name = nameValue;
        
        const emailValue = this.elements.get('email')?.value;
        if (emailValue) contact.email = emailValue;
        
        const phoneValue = this.elements.get('phone')?.value;
        if (phoneValue) contact.phone = phoneValue;
        
        const preferredContactValue = this.elements.get('preferredContact')?.value;
        if (preferredContactValue) contact.preferredContact = preferredContactValue;
        
        const locationValue = this.elements.get('location')?.value;
        if (locationValue) contact.location = locationValue;
        
        return { ramSpec, contact };
      },
      
      // Set field value
      setField(name: string, value: string) {
        if (!this.elements.has(name)) {
          this.elements.set(name, { 
            value: '', 
            classList: new Set(), 
            focused: false, 
            interacted: false 
          });
        }
        this.elements.get(name)!.value = value;
      },
      
      // Check if field has feedback
      hasFieldFeedback(name: string): boolean {
        return this.feedbackMessages.has(name);
      },
      
      // Get feedback message for field
      getFieldFeedback(name: string): string | undefined {
        return this.feedbackMessages.get(name);
      },
      
      // Check if field has specific visual state
      hasFieldState(name: string, state: 'error' | 'success' | 'info'): boolean {
        return this.elements.get(name)?.classList.has(state) || false;
      }
    };
    
    return mockForm;
  };

  // Generator for form field interactions
  const formFieldArb = fc.constantFrom(
    'type', 'capacity', 'speed', 'brand', 'condition', 'quantity',
    'name', 'email', 'phone', 'preferredContact', 'location'
  );

  const interactionArb = fc.constantFrom('focus', 'blur', 'input');

  // Generator for field values (both valid and invalid)
  const fieldValueArb = fc.oneof(
    // Valid values
    fc.constantFrom('DDR4', '16', '3200', 'Corsair', 'new', '2', 'John Doe', 'john@example.com', '(555) 123-4567', 'email', 'New York'),
    // Invalid values
    fc.constantFrom('', 'InvalidType', '999', '99999', 'UnknownBrand', 'broken', '0', 'a', 'invalid-email', '123', 'invalid', 'x')
  );

  it('Property 5: Form interaction feedback - for any user interaction with forms, the system should provide immediate feedback and validation messages', () => {
    fc.assert(
      fc.property(
        formFieldArb,
        interactionArb,
        fieldValueArb,
        (fieldName, interaction, fieldValue) => {
          const mockForm = createMockFormWithFeedback();
          
          // Set up initial form state with some valid data
          mockForm.setField('type', 'DDR4');
          mockForm.setField('capacity', '16');
          mockForm.setField('speed', '3200');
          mockForm.setField('brand', 'Corsair');
          mockForm.setField('condition', 'new');
          mockForm.setField('quantity', '2');
          mockForm.setField('name', 'John Doe');
          mockForm.setField('email', 'john@example.com');
          mockForm.setField('phone', '(555) 123-4567');
          mockForm.setField('preferredContact', 'email');
          mockForm.setField('location', 'New York');
          
          // Override the specific field we're testing
          mockForm.setField(fieldName, fieldValue);
          
          // Mark the field as interacted since we're testing interaction
          if (!mockForm.elements.has(fieldName)) {
            mockForm.elements.set(fieldName, { 
              value: fieldValue, 
              classList: new Set(), 
              focused: false, 
              interacted: true 
            });
          } else {
            mockForm.elements.get(fieldName)!.interacted = true;
          }
          
          // Perform the interaction
          if (interaction === 'input') {
            mockForm.interactWithField(fieldName, interaction, fieldValue);
          } else {
            mockForm.interactWithField(fieldName, interaction);
          }
          
          // Verify immediate feedback is provided
          switch (interaction) {
            case 'focus':
              // Focus should clear any existing errors (immediate feedback)
              expect(mockForm.hasFieldState(fieldName, 'error')).toBe(false);
              break;
              
            case 'input':
              // Input should clear errors immediately (immediate feedback)
              expect(mockForm.hasFieldState(fieldName, 'error')).toBe(false);
              break;
              
            case 'blur':
              // Blur should trigger validation and provide feedback
              const hasValidValue = fieldValue && fieldValue.trim().length > 0;
              
              if (hasValidValue) {
                // Should have some form of feedback (either success or error)
                const hasFeedback = mockForm.hasFieldFeedback(fieldName);
                expect(hasFeedback).toBe(true);
                
                // If there's feedback, it should be a non-empty message
                if (hasFeedback) {
                  const feedback = mockForm.getFieldFeedback(fieldName);
                  expect(feedback).toBeDefined();
                  expect(typeof feedback).toBe('string');
                  expect(feedback!.length).toBeGreaterThan(0);
                }
                
                // Should have visual state (error or success)
                const hasVisualState = mockForm.hasFieldState(fieldName, 'error') || 
                                     mockForm.hasFieldState(fieldName, 'success');
                expect(hasVisualState).toBe(true);
              }
              break;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5b: Form interaction feedback - validation messages should be specific and helpful', () => {
    fc.assert(
      fc.property(
        formFieldArb,
        (fieldName) => {
          const mockForm = createMockFormWithFeedback();
          
          // Set up form with invalid data for the specific field
          const invalidValues: Record<string, string> = {
            'type': 'InvalidType',
            'capacity': '999',
            'speed': '99999',
            'brand': 'UnknownBrand',
            'condition': 'broken',
            'quantity': '0',
            'name': 'a',
            'email': 'invalid-email',
            'phone': '123',
            'preferredContact': 'invalid',
            'location': 'x'
          };
          
          // Set valid values for other fields
          mockForm.setField('type', 'DDR4');
          mockForm.setField('capacity', '16');
          mockForm.setField('speed', '3200');
          mockForm.setField('brand', 'Corsair');
          mockForm.setField('condition', 'new');
          mockForm.setField('quantity', '2');
          mockForm.setField('name', 'John Doe');
          mockForm.setField('email', 'john@example.com');
          mockForm.setField('phone', '(555) 123-4567');
          mockForm.setField('preferredContact', 'email');
          mockForm.setField('location', 'New York');
          
          // Set invalid value for the field we're testing
          const invalidValue = invalidValues[fieldName];
          if (invalidValue) {
            mockForm.setField(fieldName, invalidValue);
            
            // Trigger validation by simulating blur
            mockForm.interactWithField(fieldName, 'blur');
            
            // Should have error feedback
            expect(mockForm.hasFieldState(fieldName, 'error')).toBe(true);
            
            // Error message should be specific and helpful
            const errorMessage = mockForm.getFieldFeedback(fieldName);
            expect(errorMessage).toBeDefined();
            expect(typeof errorMessage).toBe('string');
            expect(errorMessage!.length).toBeGreaterThan(0);
            
            // Message should contain relevant information about the field
            const lowerMessage = errorMessage!.toLowerCase();
            const lowerFieldName = fieldName.toLowerCase();
            
            // Should mention the field or related concepts
            const isRelevant = lowerMessage.includes(lowerFieldName) ||
                             lowerMessage.includes('required') ||
                             lowerMessage.includes('invalid') ||
                             lowerMessage.includes('format') ||
                             lowerMessage.includes('must be');
            
            expect(isRelevant).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5c: Form interaction feedback - successful validation should provide positive feedback', () => {
    fc.assert(
      fc.property(
        formFieldArb,
        (fieldName) => {
          const mockForm = createMockFormWithFeedback();
          
          // Set up form with valid data
          const validValues: Record<string, string> = {
            'type': 'DDR4',
            'capacity': '16',
            'speed': '3200',
            'brand': 'Corsair',
            'condition': 'new',
            'quantity': '2',
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '(555) 123-4567',
            'preferredContact': 'email',
            'location': 'New York'
          };
          
          // Set all fields to valid values
          Object.entries(validValues).forEach(([field, value]) => {
            mockForm.setField(field, value);
          });
          
          // Simulate interaction with the field
          mockForm.interactWithField(fieldName, 'input', validValues[fieldName]);
          mockForm.interactWithField(fieldName, 'blur');
          
          // Should have some form of feedback
          const hasFeedback = mockForm.hasFieldFeedback(fieldName);
          expect(hasFeedback).toBe(true);
          
          // Should not have error state for valid input
          expect(mockForm.hasFieldState(fieldName, 'error')).toBe(false);
          
          // Should have success state or at least no error
          const hasSuccessOrNoError = mockForm.hasFieldState(fieldName, 'success') || 
                                     !mockForm.hasFieldState(fieldName, 'error');
          expect(hasSuccessOrNoError).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: ram-buying-site, Property 6: Contact validation
 * Validates: Requirements 6.2
 */

describe('Contact Validation Properties', () => {
  // Valid values for generating test data
  const validPreferredContacts = ['email', 'phone', 'either'] as const;

  // Generator for valid email addresses
  const validEmailArb = fc.emailAddress();

  // Generator for valid phone numbers (10-15 digits with optional formatting)
  const validPhoneArb = fc.oneof(
    // Plain digits
    fc.integer({ min: 1000000000, max: 999999999999999 }).map(n => n.toString()),
    // With formatting
    fc.tuple(
      fc.integer({ min: 100, max: 999 }),
      fc.integer({ min: 100, max: 999 }),
      fc.integer({ min: 1000, max: 9999 })
    ).map(([area, exchange, number]) => `(${area}) ${exchange}-${number}`),
    // International format
    fc.tuple(
      fc.integer({ min: 1, max: 99 }),
      fc.integer({ min: 1000000000, max: 9999999999 })
    ).map(([country, number]) => `+${country} ${number}`)
  );

  // Generator for valid names (2+ characters)
  const validNameArb = fc.oneof(
    fc.constant('John Doe'),
    fc.constant('Jane Smith'),
    fc.constant('Bob Johnson'),
    fc.constant('Alice Brown')
  );

  // Generator for valid locations (2+ characters)
  const validLocationArb = fc.oneof(
    fc.constant('New York'),
    fc.constant('Los Angeles'),
    fc.constant('Chicago'),
    fc.constant('Houston')
  );

  // Generator for valid contact information
  const validContactArb = fc.record({
    name: validNameArb,
    email: validEmailArb,
    phone: validPhoneArb,
    preferredContact: fc.constantFrom(...validPreferredContacts),
    location: validLocationArb
  });

  // Generator for invalid contact information
  const invalidContactArb = fc.oneof(
    // Missing name
    fc.record({
      email: validEmailArb,
      phone: validPhoneArb,
      preferredContact: fc.constantFrom(...validPreferredContacts),
      location: validLocationArb
    }),
    // Missing email
    fc.record({
      name: validNameArb,
      phone: validPhoneArb,
      preferredContact: fc.constantFrom(...validPreferredContacts),
      location: validLocationArb
    }),
    // Missing phone
    fc.record({
      name: validNameArb,
      email: validEmailArb,
      preferredContact: fc.constantFrom(...validPreferredContacts),
      location: validLocationArb
    }),
    // Invalid email format
    fc.record({
      name: validNameArb,
      email: fc.constant('invalid-email'),
      phone: validPhoneArb,
      preferredContact: fc.constantFrom(...validPreferredContacts),
      location: validLocationArb
    }),
    // Invalid phone format
    fc.record({
      name: validNameArb,
      email: validEmailArb,
      phone: fc.constant('123'),
      preferredContact: fc.constantFrom(...validPreferredContacts),
      location: validLocationArb
    }),
    // Invalid name (too short)
    fc.record({
      name: fc.constant('a'),
      email: validEmailArb,
      phone: validPhoneArb,
      preferredContact: fc.constantFrom(...validPreferredContacts),
      location: validLocationArb
    }),
    // Invalid preferredContact - using any to bypass TypeScript checking
    fc.record({
      name: validNameArb,
      email: validEmailArb,
      phone: validPhoneArb,
      preferredContact: fc.constant('invalid'),
      location: validLocationArb
    }).map(contact => contact as any) // Cast to any to bypass TypeScript checking
  );

  it('Property 6: Contact validation - for any contact information submission, the system should validate email format and phone number structure, rejecting invalid formats with specific error messages', () => {
    fc.assert(
      fc.property(
        validContactArb,
        (validContact) => {
          const result = validateSellerContact(validContact);
          
          // Valid contact information should pass validation
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
          
          // The type guard should also return true
          expect(isValidSellerContact(validContact)).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6b: Contact validation - for any invalid contact information, the system should reject it with specific error messages', () => {
    fc.assert(
      fc.property(
        invalidContactArb,
        (invalidContact) => {
          const result = validateSellerContact(invalidContact);
          
          // Invalid contact information should fail validation
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
          
          // Each error should have a field and message
          result.errors.forEach(error => {
            expect(error.field).toBeDefined();
            expect(typeof error.field).toBe('string');
            expect(error.field.length).toBeGreaterThan(0);
            
            expect(error.message).toBeDefined();
            expect(typeof error.message).toBe('string');
            expect(error.message.length).toBeGreaterThan(0);
          });
          
          // The type guard should also return false
          expect(isValidSellerContact(invalidContact)).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6c: Contact validation - email format validation should reject malformed emails', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('invalid-email'), // no @ or dot
          fc.constant('@domain.com'), // missing local part
          fc.constant('user@'), // missing domain
          fc.constant('user@domain'), // missing TLD
          fc.constant('user.domain.com'), // no @ symbol
          fc.constant('user@@domain.com') // double @
        ),
        validNameArb,
        validPhoneArb,
        fc.constantFrom(...validPreferredContacts),
        validLocationArb,
        (invalidEmail, name, phone, preferredContact, location) => {
          const contact = {
            name,
            email: invalidEmail,
            phone,
            preferredContact,
            location
          };
          
          const result = validateSellerContact(contact);
          
          // Should fail validation due to invalid email
          expect(result.isValid).toBe(false);
          
          // Should have an email-specific error
          const emailError = result.errors.find(error => error.field === 'email');
          expect(emailError).toBeDefined();
          expect(emailError?.message).toContain('format');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6d: Contact validation - phone number structure validation should reject invalid phone numbers', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('123'), // too short
          fc.constant('abc123def'), // letters mixed with numbers
          fc.constant('12345678901234567890'), // too long
          fc.constant('123-45'), // too short even with formatting
          fc.constant('abcdefghij') // letters only
        ),
        validNameArb,
        validEmailArb,
        fc.constantFrom(...validPreferredContacts),
        validLocationArb,
        (invalidPhone, name, email, preferredContact, location) => {
          const contact = {
            name,
            email,
            phone: invalidPhone,
            preferredContact,
            location
          };
          
          const result = validateSellerContact(contact);
          
          // Should fail validation due to invalid phone
          expect(result.isValid).toBe(false);
          
          // Should have a phone-specific error
          const phoneError = result.errors.find(error => error.field === 'phone');
          expect(phoneError).toBeDefined();
          expect(phoneError?.message).toContain('digit');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});