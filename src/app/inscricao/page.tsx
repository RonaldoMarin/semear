"use client"
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Box,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import { toFormikValidationSchema } from "zod-formik-adapter"

export default function Inscricao() {
  const initialValues: any = {
    nome: "",
    email: "",
    senha: "",
  }

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: onSubmit,
    // validationSchema: toFormikValidationSchema(),
    enableReinitialize: true,
  })

  function onSubmit(fields: any, { setStatus, setSubmitting }: any) {
    setStatus()
  }

  return (
    <Box maxW="lg" mx="auto" mt="6">
      <FormLabel>Dados de inscrição</FormLabel>
      <FormControl id="email" isRequired mb={2}>
        <FormLabel>Email</FormLabel>
        <Input
          className="Input"
          type="email"
          name="email"
          placeholder="Insira seu email.."
          errorBorderColor="red.500"
          required
        />
      </FormControl>

      <FormLabel>Usuário</FormLabel>
      <Input type="text" placeholder="Insira seu nome.." />

      <FormLabel>Senha</FormLabel>
      <Input type="password" placeholder="Inisira sua senha.." />
    </Box>
  )
}
