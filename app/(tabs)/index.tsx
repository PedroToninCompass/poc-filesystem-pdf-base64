import {
  View,
  StyleSheet,
  Button,
  Text,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React from "react";

async function getPdfBase64() {
  const base64String =
    "JVBERi0xLjEKJcKlwrHDqwoKMSAwIG9iagogIDw8IC9UeXBlIC9DYXRhbG9nCiAgICAgL1BhZ2VzIDIgMCBSCiAgPj4KZW5kb2JqCgoyIDAgb2JqCiAgPDwgL1R5cGUgL1BhZ2VzCiAgICAgL0tpZHMgWzMgMCBSXQogICAgIC9Db3VudCAxCiAgICAgL01lZGlhQm94IFswIDAgMzAwIDE0NF0KICA+PgplbmRvYmoKCjMgMCBvYmoKICA8PCAgL1R5cGUgL1BhZ2UKICAgICAgL1BhcmVudCAyIDAgUgogICAgICAvUmVzb3VyY2VzCiAgICAgICA8PCAvRm9udAogICAgICAgICAgIDw8IC9GMQogICAgICAgICAgICAgICA8PCAvVHlwZSAvRm9udAogICAgICAgICAgICAgICAgICAvU3VidHlwZSAvVHlwZTEKICAgICAgICAgICAgICAgICAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgogICAgICAgICAgICAgICA+PgogICAgICAgICAgID4+CiAgICAgICA+PgogICAgICAvQ29udGVudHMgNCAwIFIKICA+PgplbmRvYmoKCjQgMCBvYmoKICA8PCAvTGVuZ3RoIDU1ID4+CnN0cmVhbQogIEJUCiAgICAvRjEgMTggVGYKICAgIDAgMCBUZAogICAgKEhlbGxvIFdvcmxkKSBUagogIEVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMDc3IDAwMDAwIG4gCjAwMDAwMDAxNzggMDAwMDAgbiAKMDAwMDAwMDQ1NyAwMDAwMCBuIAp0cmFpbGVyCiAgPDwgIC9Sb290IDEgMCBSCiAgICAgIC9TaXplIDUKICA+PgpzdGFydHhyZWYKNTY1CiUlRU9GCg==";
  // make a timeout to simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return base64String;
}

export default function HomeScreen() {
  const [isFluxo1Loading, setIsFluxo1Loading] = React.useState(false);
  const [isFluxo2Loading, setIsFluxo2Loading] = React.useState(false);

  async function createFile(filename: string) {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      console.log("permissão negada");
      return;
    }

    try {
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        "application/pdf"
      );
      return uri;
    } catch (e) {
      console.log("erro ao criar o arquivo: ", e);
      return;
    }
  }

  async function savePdfFluxo1(base64String: string, uri: string) {
    try {
      await FileSystem.writeAsStringAsync(uri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await Sharing.shareAsync(uri, {
        dialogTitle: "PDF salvo com sucesso",
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      console.log("erro ao escrever o arquivo: ", e);
      return;
    }
  }

  async function savePdfFluxo2(base64String: string, uri: string) {
    try {
      if (Platform.OS === "android") {
        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          uri,
          base64String,
          { encoding: FileSystem.EncodingType.Base64 }
        );
      } else {
        await FileSystem.writeAsStringAsync(uri, base64String, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(uri, {
          dialogTitle: "PDF salvo com sucesso",
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
        });
      }
    } catch (e) {
      console.log("erro ao escrever o arquivo: ", e);
      return;
    }
  }

  async function downloadPdfBase64() {
    try {
      const base64String = await getPdfBase64();
      return base64String;
    } catch (e) {
      console.log("erro ao baixar o base64 do pdf: ", e);
    }
  }

  async function handleDownloadFluxo1() {
    setIsFluxo1Loading(true);
    const pdfBase64 = await downloadPdfBase64();
    if (!pdfBase64) {
      Alert.alert("Erro", "Erro ao baixar o pdf");
      setIsFluxo1Loading(false);
      return;
    }
    const randomString = new Date().getTime().toString();
    const filename = `${randomString}.pdf`;
    const uri = `${FileSystem.documentDirectory}${filename}`;
    await savePdfFluxo1(pdfBase64, uri);
    setIsFluxo1Loading(false);
  }

  async function handleDownloadFluxo2() {
    setIsFluxo2Loading(true);
    const pdfBase64 = await downloadPdfBase64();
    if (!pdfBase64) {
      Alert.alert("Erro", "Erro ao baixar o pdf");
      setIsFluxo2Loading(false);
      return;
    }
    const randomString = new Date().getTime().toString();
    const filename = `${randomString}.pdf`;
    let uri: string | undefined;
    if (Platform.OS === "android") {
      uri = await createFile(filename);
    } else {
      uri = `${FileSystem.documentDirectory}${filename}`;
    }
    if (!uri) {
      Alert.alert("Erro", "Erro ao criar o arquivo");
      setIsFluxo2Loading(false);
      return;
    }
    console.log(uri);
    try {
      await savePdfFluxo2(pdfBase64, uri);
      Alert.alert(
        "Sucesso",
        "Nota fiscal [número] baixada com sucesso. Acesse seu armazenamento interno."
      );
    } catch (e) {
      Alert.alert("Erro", "Erro ao salvar o pdf");
    }
    setIsFluxo2Loading(false);
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Fluxo 1</Text>
        <Text style={styles.description}>
          android e ios salvam no diretório do app e permitem compartilhar após
          o download
        </Text>
        <Text style={styles.description}>
          não fica acessível depois, só via app
        </Text>
        {isFluxo1Loading ? (
          <ActivityIndicator />
        ) : (
          <Button onPress={handleDownloadFluxo1} title="Baixar" />
        )}
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Fluxo 2</Text>
        <Text style={styles.description}>
          android salva em uma pasta acessível, o usuário precisa dar permissão
        </Text>
        <Text style={styles.description}>
          ios mantem igual o fluxo 1, não ficando acessível após fechar o modal
          de compartilhamento
        </Text>
        {isFluxo2Loading ? (
          <ActivityIndicator />
        ) : (
          <Button onPress={handleDownloadFluxo2} title="Baixar" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
  },
  container: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
});
