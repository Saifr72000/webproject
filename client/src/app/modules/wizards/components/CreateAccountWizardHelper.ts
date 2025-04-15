import * as Yup from "yup";

export interface ICreateAccount {
  accountType: string;
  accountTeamSize: string;
  accountName: string;
  accountPlan: string;
  businessName: string;
  businessDescriptor: string;
  businessType: string;
  businessDescription: string;
  businessEmail: string;
  nameOnCard: string;
  cardNumber: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCvv: string;
  saveCard: string;
}

const createAccountSchemas = [
  Yup.object({
    accountType: Yup.string().required().label("Study Type"),
  }),
  Yup.object({
    accountName: Yup.string().required().label("Project Code"),
    businessName: Yup.string().required().label("Study Title"),
    businessDescriptor: Yup.string().required().label("Short Descriptor"),
    businessType: Yup.string().required().label("Study Category"),
    businessDescription: Yup.string().required().label("Study Description"),
    businessEmail: Yup.string().email().required().label("Contact Email"),
  }),
  Yup.object({
    nameOnCard: Yup.string().required().label("Lead Researcher"),
    cardNumber: Yup.string().required().label("Estimated Participants"),
    cardExpiryMonth: Yup.string().required().label("Start Month"),
    cardExpiryYear: Yup.string().required().label("End Year"),
    cardCvv: Yup.string().required().label("Study Location"),
  }),
];

const inits: ICreateAccount = {
  accountType: "clinical",
  accountTeamSize: "50+",
  accountName: "",
  accountPlan: "1",
  businessName: "",
  businessDescriptor: "",
  businessType: "1",
  businessDescription: "",
  businessEmail: "",
  nameOnCard: "",
  cardNumber: "",
  cardExpiryMonth: "1",
  cardExpiryYear: new Date().getFullYear().toString(),
  cardCvv: "",
  saveCard: "draft",
};

export { createAccountSchemas, inits };
