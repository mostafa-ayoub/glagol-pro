const Joi = require('joi');

// User validation schemas
const userValidation = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid('admin', 'reception', 'translator').default('translator'),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    nationality: Joi.string().optional(),
    specialization: Joi.string().optional(),
    hourlyRate: Joi.number().min(0).default(0),
    permissions: Joi.object({
      orders: Joi.boolean().default(true),
      companies: Joi.boolean().default(true),
      finance: Joi.boolean().default(false),
      staff: Joi.boolean().default(false),
      settings: Joi.boolean().default(false)
    }).default()
  }),
  
  update: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    role: Joi.string().valid('admin', 'reception', 'translator'),
    phone: Joi.string(),
    address: Joi.string(),
    nationality: Joi.string(),
    specialization: Joi.string(),
    hourlyRate: Joi.number().min(0),
    isActive: Joi.boolean(),
    permissions: Joi.object({
      orders: Joi.boolean(),
      companies: Joi.boolean(),
      finance: Joi.boolean(),
      staff: Joi.boolean(),
      settings: Joi.boolean()
    })
  })
};

// Order validation schemas
const orderValidation = {
  create: Joi.object({
    client: Joi.object({
      name: Joi.string().required().min(2),
      phone: Joi.string(),
      email: Joi.string().email(),
      nationality: Joi.string(),
      address: Joi.string()
    }).required(),
    items: Joi.array().items(
      Joi.object({
        serviceId: Joi.number().required(),
        serviceName: Joi.object({
          ar: Joi.string(),
          ru: Joi.string()
        }),
        quantity: Joi.number().min(1).default(1),
        price: Joi.number().min(0).required(),
        translatorFee: Joi.number().min(0).default(0),
        notaryFee: Joi.number().min(0).default(0)
      })
    ).min(1).required(),
    staffId: Joi.number(),
    workflow: Joi.string().valid('new', 'translate', 'review', 'notary', 'ready', 'delivered', 'cancelled').default('new'),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
    deadline: Joi.date(),
    notes: Joi.string(),
    totals: Joi.object({
      discount: Joi.number().min(0).default(0),
      paid: Joi.number().min(0).default(0)
    }).default()
  }),
  
  update: Joi.object({
    client: Joi.object({
      name: Joi.string().min(2),
      phone: Joi.string(),
      email: Joi.string().email(),
      nationality: Joi.string(),
      address: Joi.string()
    }),
    items: Joi.array().items(
      Joi.object({
        serviceId: Joi.number(),
        serviceName: Joi.object({
          ar: Joi.string(),
          ru: Joi.string()
        }),
        quantity: Joi.number().min(1),
        price: Joi.number().min(0),
        translatorFee: Joi.number().min(0),
        notaryFee: Joi.number().min(0)
      })
    ),
    staffId: Joi.number(),
    workflow: Joi.string().valid('new', 'translate', 'review', 'notary', 'ready', 'delivered', 'cancelled'),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
    deadline: Joi.date(),
    notes: Joi.string(),
    status: Joi.string().valid('new', 'partial', 'done', 'cancelled'),
    totals: Joi.object({
      discount: Joi.number().min(0),
      paid: Joi.number().min(0)
    })
  })
};

// Service validation schemas
const serviceValidation = {
  create: Joi.object({
    name: Joi.object({
      ar: Joi.string().required(),
      ru: Joi.string().required()
    }).required(),
    category: Joi.string().valid('translation', 'notary', 'legal', 'other').default('translation'),
    basePrice: Joi.number().min(0).required(),
    translatorFee: Joi.number().min(0).default(0),
    notaryFee: Joi.number().min(0).default(0),
    unit: Joi.string().valid('page', 'document', 'hour', 'word').default('document'),
    description: Joi.object({
      ar: Joi.string(),
      ru: Joi.string()
    }),
    sortOrder: Joi.number().default(0)
  }),
  
  update: Joi.object({
    name: Joi.object({
      ar: Joi.string(),
      ru: Joi.string()
    }),
    category: Joi.string().valid('translation', 'notary', 'legal', 'other'),
    basePrice: Joi.number().min(0),
    translatorFee: Joi.number().min(0),
    notaryFee: Joi.number().min(0),
    unit: Joi.string().valid('page', 'document', 'hour', 'word'),
    description: Joi.object({
      ar: Joi.string(),
      ru: Joi.string()
    }),
    isActive: Joi.boolean(),
    sortOrder: Joi.number()
  })
};

// Company validation schemas
const companyValidation = {
  create: Joi.object({
    name: Joi.string().required().min(2),
    representative: Joi.object({
      name: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email()
    }),
    address: Joi.string(),
    phone: Joi.string(),
    email: Joi.string().email(),
    taxId: Joi.string(),
    registrationNumber: Joi.string(),
    contractDetails: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
      terms: Joi.string(),
      discountRate: Joi.number().min(0).max(100).default(0)
    }),
    financial: Joi.object({
      creditLimit: Joi.number().min(0).default(0)
    }).default(),
    notes: Joi.string()
  }),
  
  update: Joi.object({
    name: Joi.string().min(2),
    representative: Joi.object({
      name: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email()
    }),
    address: Joi.string(),
    phone: Joi.string(),
    email: Joi.string().email(),
    taxId: Joi.string(),
    registrationNumber: Joi.string(),
    contractDetails: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
      terms: Joi.string(),
      discountRate: Joi.number().min(0).max(100)
    }),
    financial: Joi.object({
      creditLimit: Joi.number().min(0)
    }),
    status: Joi.string().valid('active', 'inactive', 'suspended'),
    notes: Joi.string()
  })
};

// Login validation
const loginValidation = Joi.object({
  role: Joi.string().valid('admin', 'reception', 'translator').required(),
  password: Joi.string().required().min(1)
});

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }
    
    req[property] = value;
    next();
  };
};

module.exports = {
  userValidation,
  orderValidation,
  serviceValidation,
  companyValidation,
  loginValidation,
  validate
};
