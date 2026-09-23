import {
  useEffect,
  useRef,
  useState
} from "react";

import type { ReactNode } from "react";
import type { User } from "../../auth/User";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BackupIcon from "@mui/icons-material/Backup";
import StorageIcon from "@mui/icons-material/Storage";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import BackButton from "../../components/common/BackButton";

import {
  getPrintHistory,
  registerPrint
} from "../../services/PrintHistoryService";

import {
  createUserId
} from "../../services/UserStorage";

import {
  addSupabaseUser,
  deleteSupabaseUser,
  getSupabaseUsers,
  setSupabaseUserActive,
  updateSupabaseUser
} from "../../services/SupabaseUserService";


interface BackupFile {

  application: string;

  version: number;

  createdAt: string;

  data: Record<string, string>;

}


interface UserFormData {

  id: string;

  fullName: string;

  username: string;

  password: string;

  role: "supervisor" | "operator";

  active: boolean;

}


const EMPTY_USER: UserFormData = {

  id: "",

  fullName: "",

  username: "",

  password: "",

  role: "operator",

  active: true

};


export default function Settings() {


  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const [
    message,
    setMessage
  ] = useState("");


  const [
    confirmOpen,
    setConfirmOpen
  ] = useState(false);


  const [
    pendingBackup,
    setPendingBackup
  ] = useState<BackupFile | null>(
    null
  );


  const [
    testingDatabase,
    setTestingDatabase
  ] = useState(false);


  const [
    databaseStatus,
    setDatabaseStatus
  ] = useState<
    "idle" |
    "success" |
    "error"
  >("idle");


  const [
    databaseMessage,
    setDatabaseMessage
  ] = useState("");


  /*
   * ==================================================
   * USUARIOS
   * ==================================================
   */

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [userForm, setUserForm] = useState<UserFormData>(EMPTY_USER);
  const [userError, setUserError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);


  async function loadUsers() {

    setLoadingUsers(true);

    try {

      const loadedUsers =
        await getSupabaseUsers();

      setUsers(loadedUsers);

    }
    catch (error) {

      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los usuarios."
      );

    }
    finally {

      setLoadingUsers(false);

    }

  }


  useEffect(() => {

    void loadUsers();

  }, []);


  function openNewUser() {

    setEditingUser(false);
    setUserError("");

    setUserForm({
      ...EMPTY_USER,
      id: createUserId()
    });

    setUserDialogOpen(true);

  }


  function openEditUser(
    user: User
  ) {

    setEditingUser(true);
    setUserError("");

    setUserForm({
      id: user.id,
      fullName: user.fullName,
      username: user.username,

      /*
       * Nunca mostramos ni recuperamos
       * la contraseña actual.
       * Vacío = mantener contraseña.
       */
      password: "",

      role: user.role,
      active: user.active
    });

    setUserDialogOpen(true);

  }


  function closeUserDialog() {

    if (savingUser) {
      return;
    }

    setUserDialogOpen(false);
    setUserError("");

  }


  async function saveUser() {

    const fullName =
      userForm.fullName.trim();

    const username =
      userForm.username.trim();

    const password =
      userForm.password;


    if (
      !fullName
      ||
      !username
    ) {

      setUserError(
        "Completa el nombre y el usuario."
      );

      return;

    }


    /*
     * Al crear un usuario sí exigimos contraseña.
     * Al editar, vacío significa conservar la actual.
     */
    if (
      !editingUser
      &&
      !password
    ) {

      setUserError(
        "Introduce una contraseña para el nuevo usuario."
      );

      return;

    }


    const userData = {
      id:
        userForm.id ||
        createUserId(),
      fullName,
      username,
      password,
      role: userForm.role,
      active: userForm.active
    };


    setSavingUser(true);
    setUserError("");


    try {

      const savedUser =
        editingUser
          ? await updateSupabaseUser(userData)
          : await addSupabaseUser(userData);


      setUsers(currentUsers => {

        if (editingUser) {

          return currentUsers
            .map(currentUser =>
              currentUser.id === savedUser.id
                ? savedUser
                : currentUser
            )
            .sort((a, b) =>
              a.fullName.localeCompare(b.fullName)
            );

        }

        return [
          ...currentUsers,
          savedUser
        ].sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );

      });


      setUserDialogOpen(false);
      setUserError("");

      setMessage(
        editingUser
          ? "Usuario actualizado correctamente."
          : "Usuario creado correctamente."
      );

    }
    catch (error) {

      setUserError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el usuario."
      );

    }
    finally {

      setSavingUser(false);

    }

  }


  async function changeUserActive(
    user: User,
    active: boolean
  ) {

    try {

      await setSupabaseUserActive(
        user.id,
        active
      );

      setUsers(currentUsers =>
        currentUsers.map(currentUser =>
          currentUser.id === user.id
            ? {
                ...currentUser,
                active
              }
            : currentUser
        )
      );

      setMessage(
        active
          ? `${user.fullName} ha sido activado.`
          : `${user.fullName} ha sido desactivado.`
      );

    }
    catch (error) {

      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado del usuario."
      );

    }

  }


  /*
   * ==================================================
   * BORRAR USUARIO
   * ==================================================
   */

  function askDeleteUser(
    user: User
  ) {

    setUserToDelete(user);
    setDeleteDialogOpen(true);

  }


  function cancelDeleteUser() {

    if (deletingUser) {
      return;
    }

    setDeleteDialogOpen(false);
    setUserToDelete(null);

  }


  async function confirmDeleteUser() {

    if (!userToDelete) {
      return;
    }

    const deletedUser =
      userToDelete;

    setDeletingUser(true);

    try {

      await deleteSupabaseUser(
        deletedUser.id
      );

      setUsers(currentUsers =>
        currentUsers.filter(
          user =>
            user.id !== deletedUser.id
        )
      );

      setDeleteDialogOpen(false);
      setUserToDelete(null);

      setMessage(
        `${deletedUser.fullName} ha sido eliminado.`
      );

    }
    catch (error) {

      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo borrar el usuario."
      );

    }
    finally {

      setDeletingUser(false);

    }

  }


  /*
   * ==================================================
   * EXPORTAR DATOS
   * ==================================================
   */

  function exportData() {

    const data: Record<string, string> = {};


    for (
      let i = 0;
      i < localStorage.length;
      i++
    ) {

      const key =
        localStorage.key(i);


      if (
        !key
      ) {

        continue;

      }


      const value =
        localStorage.getItem(
          key
        );


      if (
        value !== null
      ) {

        data[key] =
          value;

      }

    }


    const backup: BackupFile = {

      application:
        "Rivulis Programa Etiquetas",

      version:
        1,

      createdAt:
        new Date().toISOString(),

      data

    };


    const json =
      JSON.stringify(
        backup,
        null,
        2
      );


    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    const now =
      new Date();


    const date =
      [
        now.getFullYear(),
        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        ),
        String(
          now.getDate()
        ).padStart(
          2,
          "0"
        )
      ].join("-");


    const time =
      [
        String(
          now.getHours()
        ).padStart(
          2,
          "0"
        ),
        String(
          now.getMinutes()
        ).padStart(
          2,
          "0"
        )
      ].join("-");


    link.href =
      url;


    link.download =
      `etiquetas-backup-${date}_${time}.json`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );


    setMessage(
      "Copia de seguridad creada correctamente."
    );

  }


  /*
   * ==================================================
   * SELECCIONAR ARCHIVO
   * ==================================================
   */

  function selectImportFile() {

    fileInputRef.current?.click();

  }


  /*
   * ==================================================
   * LEER ARCHIVO
   * ==================================================
   */

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];


    event.target.value =
      "";


    if (
      !file
    ) {

      return;

    }


    try {

      const text =
        await file.text();


      const parsed =
        JSON.parse(
          text
        ) as BackupFile;


      if (
        parsed.application !==
          "Rivulis Programa Etiquetas"
        ||
        parsed.version !==
          1
        ||
        !parsed.data
        ||
        typeof parsed.data !==
          "object"
      ) {

        throw new Error(
          "Archivo no válido"
        );

      }


      setPendingBackup(
        parsed
      );


      setConfirmOpen(
        true
      );

    }
    catch {

      setMessage(
        "El archivo seleccionado no es una copia de seguridad válida."
      );

    }

  }


  /*
   * ==================================================
   * IMPORTAR DATOS
   * ==================================================
   */

  function importData() {

    if (
      !pendingBackup
    ) {

      return;

    }


    localStorage.clear();


    Object.entries(
      pendingBackup.data
    ).forEach(
      ([key, value]) => {

        localStorage.setItem(
          key,
          value
        );

      }
    );


    setConfirmOpen(
      false
    );


    setPendingBackup(
      null
    );


    window.location.reload();

  }


  /*
   * ==================================================
   * PROBAR SUPABASE
   * ==================================================
   */

  async function testDatabase() {

    if (
      testingDatabase
    ) {

      return;

    }


    setTestingDatabase(
      true
    );


    setDatabaseStatus(
      "idle"
    );


    setDatabaseMessage(
      ""
    );


    try {

      const testOrder =
        `TEST-${Date.now()}`;


      const inserted =
        await registerPrint({

          username:
            "Rubén - PRUEBA",

          productionOrder:
            testOrder,

          sku:
            "TEST-SUPABASE",

          description:
            "Registro de prueba de conexión",

          lot:
            "TEST",

          coilNumber:
            1,

          quantity:
            1,

          printer:
            "PRUEBA",

          templateName:
            "PRUEBA",

          printType:
            "PRINT",

          productionLine:
            1

        });


      const history =
        await getPrintHistory(
          20
        );


      const found =
        history.some(
          record =>
            record.id ===
              inserted.id
            ||
            record.production_order ===
              testOrder
        );


      if (
        !found
      ) {

        throw new Error(
          "El registro se guardó, pero no se pudo recuperar al consultar el historial."
        );

      }


      setDatabaseStatus(
        "success"
      );


      setDatabaseMessage(
        "Conexión correcta. La aplicación ha guardado y leído un registro en Supabase."
      );

    }
    catch (
      error
    ) {

      console.error(
        "Error probando Supabase:",
        error
      );


      setDatabaseStatus(
        "error"
      );


      setDatabaseMessage(
        error instanceof Error
          ? error.message
          : "No se pudo conectar con Supabase."
      );

    }
    finally {

      setTestingDatabase(
        false
      );

    }

  }


  /*
   * ==================================================
   * TARJETA USUARIO
   * ==================================================
   */

  function renderUser(
    user: User
  ): ReactNode {

    return (

      <Box
        key={
          user.id
        }
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center"
          },
          flexDirection: {
            xs: "column",
            sm: "row"
          },
          gap: 2,
          py: 2,
          px: 2,
          mb: 1.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2
        }}
      >

        <Box
          sx={{
            flex: 1
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap"
            }}
          >

            <Typography
              fontWeight={700}
            >

              {user.fullName}

            </Typography>


            <Chip
              size="small"
              label={
                user.role ===
                  "supervisor"
                  ? "Supervisor"
                  : "Operario"
              }
              variant="outlined"
            />


            <Chip
              size="small"
              label={
                user.active
                  ? "Activo"
                  : "Inactivo"
              }
              color={
                user.active
                  ? "success"
                  : "default"
              }
            />

          </Box>


          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >

            Usuario: {user.username}

          </Typography>

        </Box>


        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
        >

          <FormControlLabel
            control={
              <Switch
                checked={
                  user.active
                }
                onChange={
                  event =>
                    changeUserActive(
                      user,
                      event.target.checked
                    )
                }
              />
            }
            label={
              user.active
                ? "Activo"
                : "Inactivo"
            }
          />


          <Tooltip
            title="Editar usuario"
          >

            <IconButton
              onClick={
                () =>
                  openEditUser(
                    user
                  )
              }
              sx={{
                color: "#0B7A3B"
              }}
            >

              <EditIcon />

            </IconButton>

          </Tooltip>


          <Tooltip
            title="Borrar usuario"
          >

            <IconButton
              onClick={
                () =>
                  askDeleteUser(
                    user
                  )
              }
              color="error"
            >

              <DeleteIcon />

            </IconButton>

          </Tooltip>

        </Box>

      </Box>

    );

  }


  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (

    <Box
      sx={{
        maxWidth: 1050,
        mx: "auto"
      }}
    >

      <BackButton
        showBack={false}
      />


      {/* CABECERA */}

      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2
        }}
      >

        <SettingsIcon
          sx={{
            fontSize: 46,
            color: "#0B7A3B"
          }}
        />


        <Box>

          <Typography
            variant="h4"
            fontWeight={700}
          >

            Configuración

          </Typography>


          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >

            Ajustes, usuarios y copia de seguridad de la aplicación

          </Typography>

        </Box>

      </Box>


      {/* USUARIOS */}

      <Card
        sx={{
          borderRadius: 2,
          mb: 3
        }}
      >

        <CardContent
          sx={{
            p: 4
          }}
        >

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center"
              },
              flexDirection: {
                xs: "column",
                sm: "row"
              },
              gap: 2,
              mb: 3
            }}
          >

            <Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1
                }}
              >

                <PeopleIcon
                  sx={{
                    color: "#0B7A3B",
                    fontSize: 30
                  }}
                />


                <Typography
                  variant="h6"
                  fontWeight={700}
                >

                  Usuarios

                </Typography>

              </Box>


              <Typography
                color="text.secondary"
              >

                Gestiona los usuarios que pueden acceder al programa.

              </Typography>

            </Box>


            <Button
              variant="contained"
              startIcon={
                <PersonAddIcon />
              }
              onClick={
                openNewUser
              }
              sx={{
                backgroundColor:
                  "#0B7A3B",

                "&:hover": {
                  backgroundColor:
                    "#08652F"
                }
              }}
            >

              NUEVO USUARIO

            </Button>

          </Box>


          {
            loadingUsers
              ? (

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 3
                  }}
                >

                  <CircularProgress
                    size={28}
                  />

                </Box>

              )
              : users.length === 0
                ? (

                  <Alert
                    severity="info"
                  >

                    No hay usuarios creados.

                  </Alert>

                )
                : (

                  users.map(
                    user =>
                      renderUser(
                        user
                      )
                  )

                )
          }

        </CardContent>

      </Card>


      {/* BASE DE DATOS */}

      <Card
        sx={{
          borderRadius: 2,
          mb: 3
        }}
      >

        <CardContent
          sx={{
            p: 4
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2
            }}
          >

            <StorageIcon
              sx={{
                color: "#0B7A3B",
                fontSize: 30
              }}
            />


            <Typography
              variant="h6"
              fontWeight={700}
            >

              Base de datos

            </Typography>

          </Box>


          <Typography
            color="text.secondary"
            sx={{
              mb: 3,
              maxWidth: 750
            }}
          >

            Comprueba la conexión entre el Programa de Etiquetas
            y la base de datos de historial de impresión.

          </Typography>


          <Button
            variant="contained"
            disabled={
              testingDatabase
            }
            startIcon={
              testingDatabase
                ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                )
                : (
                  <StorageIcon />
                )
            }
            onClick={
              testDatabase
            }
            sx={{
              backgroundColor:
                "#0B7A3B",

              "&:hover": {
                backgroundColor:
                  "#08652F"
              }
            }}
          >

            {
              testingDatabase
                ? "PROBANDO..."
                : "PROBAR CONEXIÓN"
            }

          </Button>


          {
            databaseStatus ===
              "success"
            &&
            (
              <Alert
                severity="success"
                sx={{
                  mt: 3
                }}
              >

                {databaseMessage}

              </Alert>
            )
          }


          {
            databaseStatus ===
              "error"
            &&
            (
              <Alert
                severity="error"
                sx={{
                  mt: 3
                }}
              >

                {databaseMessage}

              </Alert>
            )
          }

        </CardContent>

      </Card>


      {/* COPIA DE SEGURIDAD */}

      <Card
        sx={{
          borderRadius: 2
        }}
      >

        <CardContent
          sx={{
            p: 4
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2
            }}
          >

            <BackupIcon
              sx={{
                color: "#0B7A3B",
                fontSize: 30
              }}
            />


            <Typography
              variant="h6"
              fontWeight={700}
            >

              Copia de seguridad

            </Typography>

          </Box>


          <Typography
            color="text.secondary"
            sx={{
              mb: 3,
              maxWidth: 750
            }}
          >

            Exporta todos los datos almacenados en este navegador
            para poder restaurarlos posteriormente o trasladarlos
            a otro equipo.

          </Typography>


          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap"
            }}
          >

            <Button
              variant="contained"
              startIcon={
                <DownloadIcon />
              }
              onClick={
                exportData
              }
              sx={{
                backgroundColor:
                  "#0B7A3B",

                "&:hover": {
                  backgroundColor:
                    "#08652F"
                }
              }}
            >

              EXPORTAR DATOS

            </Button>


            <Button
              variant="outlined"
              startIcon={
                <UploadFileIcon />
              }
              onClick={
                selectImportFile
              }
              sx={{
                color:
                  "#0B7A3B",

                borderColor:
                  "#0B7A3B",

                "&:hover": {

                  borderColor:
                    "#08652F",

                  backgroundColor:
                    "#E8F5E9"

                }
              }}
            >

              IMPORTAR DATOS

            </Button>


            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".json,application/json"
              hidden
              onChange={
                handleFileChange
              }
            />

          </Box>


          <Alert
            severity="info"
            sx={{
              mt: 3
            }}
          >

            La importación sustituirá los datos actuales de este navegador
            por los incluidos en la copia de seguridad.

          </Alert>

        </CardContent>

      </Card>


      {/* CREAR / EDITAR USUARIO */}

      <Dialog
        open={
          userDialogOpen
        }
        onClose={
          closeUserDialog
        }
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>

          {
            editingUser
              ? "Editar usuario"
              : "Nuevo usuario"
          }

        </DialogTitle>


        <DialogContent>

          {
            userError
            &&
            (
              <Alert
                severity="error"
                sx={{
                  mt: 1,
                  mb: 2
                }}
              >

                {userError}

              </Alert>
            )
          }


          <TextField
            fullWidth
            label="Nombre completo"
            value={
              userForm.fullName
            }
            onChange={
              event =>
                setUserForm({
                  ...userForm,
                  fullName:
                    event.target.value
                })
            }
            margin="normal"
          />


          <TextField
            fullWidth
            label="Usuario"
            value={
              userForm.username
            }
            onChange={
              event =>
                setUserForm({
                  ...userForm,
                  username:
                    event.target.value
                })
            }
            margin="normal"
          />


          <TextField
            fullWidth
            label={
              editingUser
                ? "Nueva contraseña"
                : "Contraseña"
            }
            type="password"
            value={
              userForm.password
            }
            onChange={
              event =>
                setUserForm({
                  ...userForm,
                  password:
                    event.target.value
                })
            }
            margin="normal"
            helperText={
              editingUser
                ? "Déjala vacía para mantener la contraseña actual."
                : "Introduce la contraseña inicial del usuario."
            }
            autoComplete="new-password"
          />


          <FormControl
            fullWidth
            margin="normal"
          >

            <InputLabel>
              Rol
            </InputLabel>


            <Select
              value={
                userForm.role
              }
              label="Rol"
              onChange={
                event =>
                  setUserForm({
                    ...userForm,
                    role:
                      event.target.value as
                        "supervisor" |
                        "operator"
                  })
              }
            >

              <MenuItem
                value="supervisor"
              >

                Supervisor

              </MenuItem>


              <MenuItem
                value="operator"
              >

                Operario

              </MenuItem>

            </Select>

          </FormControl>


          <FormControlLabel
            sx={{
              mt: 1
            }}
            control={
              <Switch
                checked={
                  userForm.active
                }
                onChange={
                  event =>
                    setUserForm({
                      ...userForm,
                      active:
                        event.target.checked
                    })
                }
              />
            }
            label="Usuario activo"
          />

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              closeUserDialog
            }
            disabled={
              savingUser
            }
          >

            CANCELAR

          </Button>


          <Button
            variant="contained"
            onClick={
              saveUser
            }
            disabled={
              savingUser
            }
            sx={{
              backgroundColor:
                "#0B7A3B",

              "&:hover": {
                backgroundColor:
                  "#08652F"
              }
            }}
          >

            {
              savingUser
                ? (
                  <>
                    <CircularProgress
                      size={18}
                      sx={{
                        mr: 1,
                        color: "inherit"
                      }}
                    />
                    GUARDANDO...
                  </>
                )
                : "GUARDAR"
            }

          </Button>

        </DialogActions>

      </Dialog>


      {/* CONFIRMACIÓN BORRAR USUARIO */}

      <Dialog
        open={
          deleteDialogOpen
        }
        onClose={
          cancelDeleteUser
        }
      >

        <DialogTitle>

          Borrar usuario

        </DialogTitle>


        <DialogContent>

          <DialogContentText>

            ¿Seguro que quieres borrar al usuario{" "}

            <strong>
              {userToDelete?.fullName}
            </strong>

            ?

            <br />
            <br />

            Esta acción eliminará el usuario del programa.

          </DialogContentText>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              cancelDeleteUser
            }
          >

            CANCELAR

          </Button>


          <Button
            variant="contained"
            color="error"
            startIcon={
              deletingUser
                ? <CircularProgress size={16} color="inherit" />
                : <DeleteIcon />
            }
            onClick={
              confirmDeleteUser
            }
            disabled={
              deletingUser
            }
          >

            {
              deletingUser
                ? "BORRANDO..."
                : "BORRAR"
            }

          </Button>

        </DialogActions>

      </Dialog>


      {/* CONFIRMACIÓN IMPORTACIÓN */}

      <Dialog
        open={
          confirmOpen
        }
        onClose={
          () =>
            setConfirmOpen(
              false
            )
        }
      >

        <DialogTitle>

          Importar copia de seguridad

        </DialogTitle>


        <DialogContent>

          <DialogContentText>

            Los datos actuales de este navegador serán sustituidos
            por los datos de la copia de seguridad seleccionada.

            <br />
            <br />

            Después de importar, la aplicación se recargará
            automáticamente.

          </DialogContentText>

        </DialogContent>


        <DialogActions>

          <Button
            onClick={
              () =>
                setConfirmOpen(
                  false
                )
            }
          >

            CANCELAR

          </Button>


          <Button
            variant="contained"
            onClick={
              importData
            }
            sx={{
              backgroundColor:
                "#0B7A3B"
            }}
          >

            IMPORTAR

          </Button>

        </DialogActions>

      </Dialog>


      {/* MENSAJE */}

      <Snackbar
        open={
          Boolean(
            message
          )
        }
        autoHideDuration={
          4000
        }
        onClose={
          () =>
            setMessage("")
        }
        message={
          message
        }
      />

    </Box>

  );

}