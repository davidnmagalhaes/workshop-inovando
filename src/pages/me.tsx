import React, { ReactElement, useRef } from "react";
import PrivatePage from "../layouts/PrivatePage";
import { NextPageWithLayout } from "./_app";
import { GetServerSideProps } from "next";
import api, { getAPIClient, httpErrorHandler } from "../services/api";
import { Container } from "@chakra-ui/react";
import ProfileForm, { FormValues } from "../components/forms/ProfileForm";
import { SubmitHandler } from "react-hook-form";
import omit from "lodash.omit";
import { removeEmptyValues } from "../utils/parse";
import { ProfileFormRefType } from "../components/forms/ProfileForm/ProfileForm";
import { toast } from "react-toastify";

type Me = {
  created_at: string;
  email: string;
  id: string;
  name: string;
  remember_me_token: null;
  status: boolean;
  updated_at: string;
};

type PageProps = {
  data: Me;
};

const Me: NextPageWithLayout<PageProps> = ({ data }) => {
  const formRef = useRef<ProfileFormRefType>(null);
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    removeEmptyValues(values);
    const apiValues = omit(values, ["created_at", "id", "confirmPassword"]);
    try {
      await api.put(`users/${data.id}`, apiValues);
    } catch (error) {
      httpErrorHandler(error, formRef.current?.setError);
    }
    toast.success("Data edited successfully!");
    formRef.current?.setValue("password", "");
    formRef.current?.setValue("confirmPassword", "");
    (document.activeElement as HTMLElement).blur();
  };
  return (
    <Container maxW="1400px" m="auto">
      <ProfileForm onSubmit={onSubmit} defaultValues={data} ref={formRef} />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  const { data } = await api.get("me");

  return {
    props: {
      data,
    },
  };
};

Me.getLayout = (app: ReactElement) => {
  return <PrivatePage title="Profile">{app}</PrivatePage>;
};

export default Me;
