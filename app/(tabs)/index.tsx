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
  const [isLoading, setIsLoading] = React.useState(false);

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

  async function savePdf(base64String: string, uri: string) {
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

  async function handleDownload() {
    setIsLoading(true);
    const pdfBase64 = await downloadPdfBase64();
    if (!pdfBase64) {
      Alert.alert("Erro", "Erro ao baixar o pdf");
      setIsLoading(false);
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
      setIsLoading(false);
      return;
    }
    console.log(uri);
    await savePdf(pdfBase64, uri);

    setIsLoading(false);
  }

  return (
    <View style={styles.screenContainer}>
      <View>
        <Text>Baixar pdf:</Text>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Button onPress={handleDownload} title="Baixar" />
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
    gap: 8,
  },
});
