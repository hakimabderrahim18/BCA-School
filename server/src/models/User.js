import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALL_ROLES, ROLES } from '../config/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom complet est obligatoire.'],
      trim: true,
      minlength: [2, 'Le nom doit comporter au moins 2 caractères.'],
      maxlength: [100, 'Le nom ne peut excéder 100 caractères.'],
    },
    email: {
      type: String,
      required: [true, 'L’adresse email est obligatoire.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Veuillez renseigner une adresse email valide.',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire.'],
      minlength: [8, 'Le mot de passe doit comporter au moins 8 caractères.'],
      select: false, // Ne pas renvoyer le mot de passe dans les requêtes par défaut
    },
    role: {
      type: String,
      enum: {
        values: ALL_ROLES,
        message: 'Rôle non valide. Valeurs autorisées : admin, editor, writer.',
      },
      default: ROLES.WRITER,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hashage du mot de passe avant sauvegarde si modifié
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode de comparaison du mot de passe candidat avec le hash stocké
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Suppression du mot de passe et du refresh token lors de la sérialisation JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

const User = mongoose.model('User', userSchema);
export default User;
