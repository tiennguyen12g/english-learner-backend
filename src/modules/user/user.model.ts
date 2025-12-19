import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserModel {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  get model() {
    return this.userModel;
  }
}

// Export model for direct use if needed
export { User, UserDocument };

